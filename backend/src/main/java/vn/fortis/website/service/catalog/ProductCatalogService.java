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
import vn.fortis.website.service.cloudinary.CloudinaryService;

@Service
@Transactional
public class ProductCatalogService {

	private static final String DEFAULT_PRODUCT_IMAGE =
			"https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?auto=format&fit=crop&w=1200&q=80";

	private final FileStorageService fileStorageService;
	private final CloudinaryService cloudinaryService;
	private final ProductCategoryRepository productCategoryRepository;
	private final ProductRepository productRepository;

	public ProductCatalogService(
			FileStorageService fileStorageService,
			CloudinaryService cloudinaryService,
			ProductCategoryRepository productCategoryRepository,
			ProductRepository productRepository
	) {
		this.fileStorageService = fileStorageService;
		this.cloudinaryService = cloudinaryService;
		this.productCategoryRepository = productCategoryRepository;
		this.productRepository = productRepository;
	}

	@Transactional(readOnly = true)
	public synchronized ProductCatalogResponse getPublicCatalog(String lang) {
		String locale = normalizeLocale(lang);
		return new ProductCatalogResponse(
				locale,
				buildPageHeader(locale),
				productCategoryRepository.findByActiveTrueOrderByCreatedAtAsc().stream()
						.map(category -> mapPublicCategory(category, locale))
						.toList(),
				productRepository.findByActiveTrueOrderByCreatedAtAsc().stream()
						.map(product -> mapPublicProduct(product, locale))
						.toList(),
				buildQuoteSection(locale),
				buildCatalogLabels(locale)
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

	private ProductCatalogResponse.PageHeader buildPageHeader(String locale) {
		if ("zh".equals(locale)) {
			return new ProductCatalogResponse.PageHeader(
					"产品目录",
					"为进口商和 B2B 采购团队提供新鲜及加工农产品。",
					"浏览符合出口需求的产品、包装规格、质量标准和询价支持。"
			);
		}
		if ("en".equals(locale)) {
			return new ProductCatalogResponse.PageHeader(
					"Product catalog",
					"Fresh and processed agricultural products for importers and B2B sourcing teams.",
					"Browse export-ready fruits and coconut-based products with packing formats, quality standards and RFQ support."
			);
		}

		return new ProductCatalogResponse.PageHeader(
				"Danh mục sản phẩm",
				"Catalog nông sản cho khách hàng nhập khẩu và đối tác B2B.",
				""
		);
	}

	private ProductCatalogResponse.QuoteSection buildQuoteSection(String locale) {
		if ("zh".equals(locale)) {
			return new ProductCatalogResponse.QuoteSection(
					"获取报价",
					"请提交产品、包装和出货需求，Fortis VN 将尽快回复。",
					"可附上采购规格、目标市场要求或参考文件，以便获得更准确的报价。",
					new ProductCatalogResponse.QuoteFields(
							"姓名",
							"公司",
							"邮箱",
							"电话 / WeChat / WhatsApp",
							"预计数量",
							"目标市场",
							"详细规格",
							"附件",
							"产品需求 / 规格 / 数量",
							"提交询价"
					)
			);
		}
		if ("en".equals(locale)) {
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

	private ProductCatalogResponse.CatalogLabels buildCatalogLabels(String locale) {
		if ("zh".equals(locale)) {
			return new ProductCatalogResponse.CatalogLabels(
					"全部产品",
					"产品列表",
					"产品详情",
					"市场 / 渠道",
					"技术规格",
					"该分类暂无产品。"
			);
		}
		if ("en".equals(locale)) {
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

	private ProductCatalogResponse.CategoryItem mapPublicCategory(ProductCategoryEntity category, String locale) {
		return new ProductCatalogResponse.CategoryItem(
				category.getId(),
				category.getSlug(),
				"vi".equals(locale) ? category.getNameVi() : category.getNameEn(),
				"vi".equals(locale) ? category.getDescriptionVi() : category.getDescriptionEn()
		);
	}

	private ProductCatalogResponse.ProductItem mapPublicProduct(ProductEntity product, String locale) {
		return new ProductCatalogResponse.ProductItem(
				product.getId(),
				product.getSlug(),
				product.getCategory().getId(),
				"vi".equals(locale) ? product.getCategory().getNameVi() : product.getCategory().getNameEn(),
				localizedText(locale, product.getNameVi(), product.getNameEn(), product.getNameZh()),
				localizedText(locale, product.getSummaryVi(), product.getSummaryEn(), product.getSummaryZh()),
				product.getImageUrl(),
				product.getSpecificationFileUrl(),
				resolveGallery(product),
				new ProductCatalogResponse.TechnicalSpecifications(
						localizedText(locale, product.getThickness(), product.getThicknessEn(), product.getThicknessZh()),
						localizedText(locale, product.getMoisture(), product.getMoistureEn(), product.getMoistureZh()),
						localizedText(locale, product.getGlueType(), product.getGlueTypeEn(), product.getGlueTypeZh()),
						localizedText(locale, product.getSize(), product.getSizeEn(), product.getSizeZh())
				),
				localizedApplications(locale, product),
				switch (locale) {
					case "en" -> "Get a quick quote";
					case "zh" -> "快速询价";
					default -> "Nhận báo giá nhanh";
				}
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
				product.getNameEn(),
				product.getNameZh(),
				product.getSummaryVi(),
				product.getSummaryEn(),
				product.getSummaryZh(),
				product.getImageUrl(),
				product.getSpecificationFileUrl(),
				resolveGallery(product),
				List.copyOf(product.getApplicationsVi()),
				List.copyOf(product.getApplicationsEn()),
				List.copyOf(product.getApplicationsZh()),
				new AdminCatalogResponse.TechnicalSpecifications(
						product.getThickness(),
						product.getMoisture(),
						product.getGlueType(),
						product.getSize()
				),
				new AdminCatalogResponse.TechnicalSpecifications(
						product.getThicknessEn(),
						product.getMoistureEn(),
						product.getGlueTypeEn(),
						product.getSizeEn()
				),
				new AdminCatalogResponse.TechnicalSpecifications(
						product.getThicknessZh(),
						product.getMoistureZh(),
						product.getGlueTypeZh(),
						product.getSizeZh()
				),
				"Nhận báo giá nhanh",
				product.isFeatured()
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
		product.setNameEn(withFallback(request.nameEn(), request.name()));
		product.setNameZh(withFallback(request.nameZh(), request.nameEn(), request.name()));
		product.setSummaryVi(request.summary());
		product.setSummaryEn(withFallback(request.summaryEn(), request.summary()));
		product.setSummaryZh(withFallback(request.summaryZh(), request.summaryEn(), request.summary()));
		List<String> galleryImages = resolveGalleryImages(request.galleryImages(), image, existingProduct);
		product.setGalleryImageUrls(galleryImages);
		product.setImageUrl(galleryImages.isEmpty() ? DEFAULT_PRODUCT_IMAGE : galleryImages.getFirst());
		product.setSpecificationFileUrl(resolveSpecificationUrl(specificationFile, existingProduct));
		product.setApplicationsVi(normalizeList(request.applications()));
		product.setApplicationsEn(normalizeListWithFallback(request.applicationsEn(), request.applications()));
		product.setApplicationsZh(normalizeListWithFallback(request.applicationsZh(), request.applicationsEn(), request.applications()));
		product.setThickness(request.specifications().thickness());
		product.setThicknessEn(localizedSpecValue(request.specificationsEn(), request.specifications(), "thickness"));
		product.setThicknessZh(localizedSpecValue(request.specificationsZh(), request.specificationsEn(), request.specifications(), "thickness"));
		product.setMoisture(request.specifications().moisture());
		product.setMoistureEn(localizedSpecValue(request.specificationsEn(), request.specifications(), "moisture"));
		product.setMoistureZh(localizedSpecValue(request.specificationsZh(), request.specificationsEn(), request.specifications(), "moisture"));
		product.setGlueType(request.specifications().glueType());
		product.setGlueTypeEn(localizedSpecValue(request.specificationsEn(), request.specifications(), "glueType"));
		product.setGlueTypeZh(localizedSpecValue(request.specificationsZh(), request.specificationsEn(), request.specifications(), "glueType"));
		product.setSize(request.specifications().size());
		product.setSizeEn(localizedSpecValue(request.specificationsEn(), request.specifications(), "size"));
		product.setSizeZh(localizedSpecValue(request.specificationsZh(), request.specificationsEn(), request.specifications(), "size"));
		product.setFeatured(Boolean.TRUE.equals(request.featured()));
		product.setActive(true);
	}

	private String normalizeLocale(String lang) {
		if ("en".equalsIgnoreCase(lang)) {
			return "en";
		}
		if ("zh".equalsIgnoreCase(lang) || "cn".equalsIgnoreCase(lang) || "zh-cn".equalsIgnoreCase(lang)) {
			return "zh";
		}
		return "vi";
	}

	private String localizedText(String locale, String vi, String en, String zh) {
		return switch (locale) {
			case "en" -> withFallback(en, vi);
			case "zh" -> withFallback(zh, en, vi);
			default -> withFallback(vi, en, zh);
		};
	}

	private List<String> localizedApplications(String locale, ProductEntity product) {
		return switch (locale) {
			case "en" -> listWithFallback(product.getApplicationsEn(), product.getApplicationsVi());
			case "zh" -> listWithFallback(product.getApplicationsZh(), product.getApplicationsEn(), product.getApplicationsVi());
			default -> listWithFallback(product.getApplicationsVi(), product.getApplicationsEn(), product.getApplicationsZh());
		};
	}

	private String withFallback(String... values) {
		for (String value : values) {
			if (value != null && !value.isBlank()) {
				return value.trim();
			}
		}
		return "";
	}

	@SafeVarargs
	private final List<String> normalizeListWithFallback(List<String>... candidates) {
		for (List<String> candidate : candidates) {
			List<String> normalized = normalizeList(candidate);
			if (!normalized.isEmpty()) {
				return normalized;
			}
		}
		return List.of();
	}

	@SafeVarargs
	private final List<String> listWithFallback(List<String>... candidates) {
		return normalizeListWithFallback(candidates);
	}

	private List<String> normalizeList(List<String> values) {
		if (values == null) {
			return List.of();
		}
		return values.stream()
				.filter(value -> value != null && !value.isBlank())
				.map(String::trim)
				.toList();
	}

	private String localizedSpecValue(
			AdminProductUpsertRequest.TechnicalSpecifications primary,
			AdminProductUpsertRequest.TechnicalSpecifications fallback,
			String field
	) {
		return withFallback(specValue(primary, field), specValue(fallback, field));
	}

	private String localizedSpecValue(
			AdminProductUpsertRequest.TechnicalSpecifications primary,
			AdminProductUpsertRequest.TechnicalSpecifications secondary,
			AdminProductUpsertRequest.TechnicalSpecifications fallback,
			String field
	) {
		return withFallback(specValue(primary, field), specValue(secondary, field), specValue(fallback, field));
	}

	private String specValue(AdminProductUpsertRequest.TechnicalSpecifications specifications, String field) {
		if (specifications == null) {
			return null;
		}
		return switch (field) {
			case "thickness" -> specifications.thickness();
			case "moisture" -> specifications.moisture();
			case "glueType" -> specifications.glueType();
			case "size" -> specifications.size();
			default -> null;
		};
	}

	private List<String> resolveGallery(ProductEntity product) {
		if (!product.getGalleryImageUrls().isEmpty()) {
			return List.copyOf(product.getGalleryImageUrls());
		}
		return List.of(product.getImageUrl());
	}

	private List<String> resolveGalleryImages(
			List<String> requestedGalleryImages,
			MultipartFile image,
			ProductEntity existingProduct
	) {
		List<String> normalizedGallery = requestedGalleryImages == null
				? List.of()
				: requestedGalleryImages.stream()
						.filter(url -> url != null && !url.isBlank())
						.map(String::trim)
						.distinct()
						.toList();

		if (!normalizedGallery.isEmpty()) {
			return normalizedGallery;
		}

		if (image != null && !image.isEmpty()) {
			return List.of(uploadImageToCloudinary(image));
		}

		if (existingProduct != null && !existingProduct.getGalleryImageUrls().isEmpty()) {
			return List.copyOf(existingProduct.getGalleryImageUrls());
		}

		if (existingProduct != null && existingProduct.getImageUrl() != null) {
			return List.of(existingProduct.getImageUrl());
		}

		return List.of(DEFAULT_PRODUCT_IMAGE);
	}

	private String uploadImageToCloudinary(MultipartFile image) {
		Object secureUrl = cloudinaryService.upload(image).get("secure_url");
		if (secureUrl == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cloudinary upload did not return a secure URL");
		}
		return secureUrl.toString();
	}

	private String resolveSpecificationUrl(MultipartFile specificationFile, ProductEntity existingProduct) {
		if (specificationFile == null || specificationFile.isEmpty()) {
			return existingProduct == null ? null : existingProduct.getSpecificationFileUrl();
		}
		return fileStorageService.store(specificationFile, "products/specifications");
	}
}
