package vn.fortis.website.service.catalog;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import vn.fortis.website.dto.catalog.AdminCatalogResponse;
import vn.fortis.website.dto.catalog.AdminCategoryRequest;
import vn.fortis.website.dto.catalog.AdminProductUpsertRequest;
import vn.fortis.website.dto.catalog.ProductCatalogResponse;
import vn.fortis.website.entity.ProductCategoryEntity;
import vn.fortis.website.entity.ProductEntity;
import vn.fortis.website.repository.ProductCategoryRepository;
import vn.fortis.website.repository.ProductRepository;

@Service
@Transactional
public class ProductCatalogService {

	private static final String DEFAULT_PRODUCT_IMAGE =
			"https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?auto=format&fit=crop&w=1200&q=80";

	private final FileStorageService fileStorageService;
	private final ProductCategoryRepository productCategoryRepository;
	private final ProductRepository productRepository;

	public ProductCatalogService(
			FileStorageService fileStorageService,
			ProductCategoryRepository productCategoryRepository,
			ProductRepository productRepository
	) {
		this.fileStorageService = fileStorageService;
		this.productCategoryRepository = productCategoryRepository;
		this.productRepository = productRepository;
	}

	@Transactional(readOnly = true)
	public synchronized ProductCatalogResponse getPublicCatalog(String lang) {
		boolean english = "en".equalsIgnoreCase(lang);
		return new ProductCatalogResponse(
				english ? "en" : "vi",
				buildPageHeader(english),
				productCategoryRepository.findByActiveTrueOrderByCreatedAtAsc().stream()
						.map(category -> mapPublicCategory(category, english))
						.toList(),
				productRepository.findByActiveTrueOrderByCreatedAtAsc().stream()
						.map(product -> mapPublicProduct(product, english))
						.toList(),
				buildQuoteSection(english),
				buildCatalogLabels(english)
		);
	}

	@Transactional(readOnly = true)
	public synchronized AdminCatalogResponse getAdminCatalog() {
		return new AdminCatalogResponse(
				productCategoryRepository.findAll().stream().map(this::mapAdminCategory).toList(),
				productRepository.findAll().stream().map(this::mapAdminProduct).toList()
		);
	}

	public synchronized AdminCatalogResponse.CategoryAdminItem createCategory(AdminCategoryRequest request) {
		validateUniqueCategorySlug(request.slug(), null);
		ProductCategoryEntity category = new ProductCategoryEntity();
		category.setId(UUID.randomUUID().toString());
		category.setSlug(request.slug());
		category.setNameVi(request.name());
		category.setNameEn(request.name());
		category.setDescriptionVi(request.description());
		category.setDescriptionEn(request.description());
		category.setActive(true);
		category = productCategoryRepository.save(category);
		return mapAdminCategory(category);
	}

	public synchronized AdminCatalogResponse.CategoryAdminItem updateCategory(String categoryId, AdminCategoryRequest request) {
		ProductCategoryEntity existingCategory = requireCategory(categoryId);
		validateUniqueCategorySlug(request.slug(), categoryId);
		existingCategory.setSlug(request.slug());
		existingCategory.setNameVi(request.name());
		existingCategory.setNameEn(request.name());
		existingCategory.setDescriptionVi(request.description());
		existingCategory.setDescriptionEn(request.description());
		return mapAdminCategory(productCategoryRepository.save(existingCategory));
	}

	public synchronized void deleteCategory(String categoryId) {
		requireCategory(categoryId);
		boolean categoryHasProducts = productRepository.existsByCategory_Id(categoryId);

		if (categoryHasProducts) {
			throw new ResponseStatusException(
					HttpStatus.BAD_REQUEST,
					"Cannot delete a category that still contains products"
			);
		}
		productCategoryRepository.deleteById(categoryId);
	}

	public synchronized AdminCatalogResponse.ProductAdminItem createProduct(
			AdminProductUpsertRequest request,
			MultipartFile image,
			MultipartFile specificationFile
	) {
		ProductCategoryEntity category = requireCategory(request.categoryId());
		validateUniqueProductSlug(request.slug(), null);
		ProductEntity product = new ProductEntity();
		product.setId(UUID.randomUUID().toString());
		applyProductValues(product, category, request, image, specificationFile, null);
		product = productRepository.save(product);
		return mapAdminProduct(product);
	}

	public synchronized AdminCatalogResponse.ProductAdminItem updateProduct(
			String productId,
			AdminProductUpsertRequest request,
			MultipartFile image,
			MultipartFile specificationFile
	) {
		ProductEntity existingProduct = requireProduct(productId);
		ProductCategoryEntity category = requireCategory(request.categoryId());
		validateUniqueProductSlug(request.slug(), productId);
		applyProductValues(existingProduct, category, request, image, specificationFile, existingProduct);
		return mapAdminProduct(productRepository.save(existingProduct));
	}

	public synchronized void deleteProduct(String productId) {
		requireProduct(productId);
		productRepository.deleteById(productId);
	}

	private ProductCatalogResponse.PageHeader buildPageHeader(boolean english) {
		if (english) {
			return new ProductCatalogResponse.PageHeader(
					"Product catalog",
					"Fresh and processed agricultural products for importers and B2B sourcing teams.",
					"Browse export-ready fruits and coconut-based products with packing formats, quality standards and RFQ support."
			);
		}

		return new ProductCatalogResponse.PageHeader(
				"Danh mục sản phẩm",
				"Catalog nông sản cho khách hàng nhập khẩu và đối tác B2B.",
				"Duyệt nhanh các dòng trái cây, dừa và sản phẩm chế biến với quy cách đóng gói, tiêu chuẩn chất lượng và biểu mẫu RFQ."
		);
	}

	private ProductCatalogResponse.QuoteSection buildQuoteSection(boolean english) {
		if (english) {
			return new ProductCatalogResponse.QuoteSection(
					"Get a quote",
					"Share your crop, packing and shipment requirements so Fortis VN can respond quickly.",
					"Attach buying specs, target market requirements or reference documents for a more accurate quotation.",
					new ProductCatalogResponse.QuoteFields(
							"Full name",
							"Company",
							"Email",
							"Phone / WeChat / WhatsApp",
							"Estimated quantity",
							"Target market",
							"Detailed specification",
							"Attachment file",
							"Product requirement / spec / quantity",
							"Send quote request"
					)
			);
		}

		return new ProductCatalogResponse.QuoteSection(
				"Nhận báo giá",
				"Gửi nhanh nhu cầu về mặt hàng, quy cách đóng gói và lịch giao để đội ngũ Fortis VN phản hồi.",
				"Có thể đính kèm tiêu chuẩn mua hàng, yêu cầu thị trường hoặc tài liệu tham chiếu để báo giá chính xác hơn.",
				new ProductCatalogResponse.QuoteFields(
						"Họ và tên",
						"Công ty",
						"Email",
						"Số điện thoại / WeChat / WhatsApp",
						"Số lượng dự kiến",
						"Thị trường xuất khẩu",
						"Quy cách chi tiết",
						"Tệp đính kèm",
						"Nhu cầu sản phẩm / quy cách / số lượng",
						"Gửi yêu cầu báo giá"
				)
		);
	}

	private ProductCatalogResponse.CatalogLabels buildCatalogLabels(boolean english) {
		if (english) {
			return new ProductCatalogResponse.CatalogLabels(
					"All products",
					"Product list",
					"Product detail",
					"Markets / channels",
					"Technical specifications",
					"No products available in this category."
			);
		}

		return new ProductCatalogResponse.CatalogLabels(
				"Tất cả",
				"Danh sách sản phẩm",
				"Chi tiết sản phẩm",
				"Thị trường / kênh tiêu thụ",
				"Thông số kỹ thuật",
				"Chưa có sản phẩm trong danh mục này."
		);
	}

	private ProductCatalogResponse.CategoryItem mapPublicCategory(ProductCategoryEntity category, boolean english) {
		return new ProductCatalogResponse.CategoryItem(
				category.getId(),
				category.getSlug(),
				english ? category.getNameEn() : category.getNameVi(),
				english ? category.getDescriptionEn() : category.getDescriptionVi()
		);
	}

	private ProductCatalogResponse.ProductItem mapPublicProduct(ProductEntity product, boolean english) {
		return new ProductCatalogResponse.ProductItem(
				product.getId(),
				product.getSlug(),
				product.getCategory().getId(),
				english ? product.getCategory().getNameEn() : product.getCategory().getNameVi(),
				english ? product.getNameEn() : product.getNameVi(),
				english ? product.getSummaryEn() : product.getSummaryVi(),
				product.getImageUrl(),
				product.getSpecificationFileUrl(),
				List.of(product.getImageUrl()),
				new ProductCatalogResponse.TechnicalSpecifications(
						product.getThickness(),
						product.getMoisture(),
						product.getGlueType(),
						product.getSize()
				),
				english ? List.copyOf(product.getApplicationsEn()) : List.copyOf(product.getApplicationsVi()),
				english ? "Get a quick quote" : "Nhận báo giá nhanh"
		);
	}

	private AdminCatalogResponse.CategoryAdminItem mapAdminCategory(ProductCategoryEntity category) {
		return new AdminCatalogResponse.CategoryAdminItem(
				category.getId(),
				category.getSlug(),
				category.getNameVi(),
				category.getDescriptionVi()
		);
	}

	private AdminCatalogResponse.ProductAdminItem mapAdminProduct(ProductEntity product) {
		return new AdminCatalogResponse.ProductAdminItem(
				product.getId(),
				product.getSlug(),
				product.getCategory().getId(),
				product.getNameVi(),
				product.getSummaryVi(),
				product.getImageUrl(),
				product.getSpecificationFileUrl(),
				List.copyOf(product.getApplicationsVi()),
				new AdminCatalogResponse.TechnicalSpecifications(
						product.getThickness(),
						product.getMoisture(),
						product.getGlueType(),
						product.getSize()
				),
				"Nhận báo giá nhanh"
		);
	}

	private ProductCategoryEntity requireCategory(String categoryId) {
		return productCategoryRepository.findById(categoryId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
	}

	private ProductEntity requireProduct(String productId) {
		return productRepository.findById(productId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
	}

	private void validateUniqueCategorySlug(String slug, String currentCategoryId) {
		boolean duplicated = productCategoryRepository.findBySlugIgnoreCase(slug)
				.map(category -> !category.getId().equals(currentCategoryId))
				.orElse(false);
		if (duplicated) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category slug already exists");
		}
	}

	private void validateUniqueProductSlug(String slug, String currentProductId) {
		boolean duplicated = productRepository.findBySlugIgnoreCase(slug)
				.map(product -> !product.getId().equals(currentProductId))
				.orElse(false);
		if (duplicated) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product slug already exists");
		}
	}

	private void applyProductValues(
			ProductEntity product,
			ProductCategoryEntity category,
			AdminProductUpsertRequest request,
			MultipartFile image,
			MultipartFile specificationFile,
			ProductEntity existingProduct
	) {
		product.setSlug(request.slug());
		product.setCategory(category);
		product.setNameVi(request.name());
		product.setNameEn(request.name());
		product.setSummaryVi(request.summary());
		product.setSummaryEn(request.summary());
		product.setImageUrl(resolveImageUrl(image, existingProduct == null ? null : existingProduct.getImageUrl()));
		product.setSpecificationFileUrl(resolveSpecificationUrl(specificationFile, existingProduct));
		product.setApplicationsVi(List.copyOf(request.applications()));
		product.setApplicationsEn(List.copyOf(request.applications()));
		product.setThickness(request.specifications().thickness());
		product.setMoisture(request.specifications().moisture());
		product.setGlueType(request.specifications().glueType());
		product.setSize(request.specifications().size());
		product.setActive(true);
	}

	private String resolveImageUrl(MultipartFile image, String existingImageUrl) {
		if (image == null || image.isEmpty()) {
			return existingImageUrl == null ? DEFAULT_PRODUCT_IMAGE : existingImageUrl;
		}
		return fileStorageService.store(image, "products/images");
	}

	private String resolveSpecificationUrl(MultipartFile specificationFile, ProductEntity existingProduct) {
		if (specificationFile == null || specificationFile.isEmpty()) {
			return existingProduct == null ? null : existingProduct.getSpecificationFileUrl();
		}
		return fileStorageService.store(specificationFile, "products/specifications");
	}
}
