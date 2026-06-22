package vn.fortis.website.service.catalog;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import vn.fortis.website.dto.catalog.AdminCatalogResponse;
import vn.fortis.website.dto.catalog.AdminCategoryRequest;
import vn.fortis.website.dto.catalog.AdminProductUpsertRequest;
import vn.fortis.website.dto.catalog.ProductCatalogResponse;
import vn.fortis.website.entity.ProductCategoryEntity;
import vn.fortis.website.entity.ProductEntity;
import vn.fortis.website.entity.ProductSpecificationValue;
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
		category.setNameEn(withFallback(request.nameEn(), request.name()));
		category.setNameZh(withFallback(request.nameZh(), request.nameEn(), request.name()));
		category.setDescriptionVi(request.description());
		category.setDescriptionEn(withFallback(request.descriptionEn(), request.description()));
		category.setDescriptionZh(withFallback(request.descriptionZh(), request.descriptionEn(), request.description()));
		category.setActive(!Boolean.FALSE.equals(request.active()));
		category = productCategoryRepository.save(category);
		return mapAdminCategory(category);
	}

	public synchronized AdminCatalogResponse.CategoryAdminItem updateCategory(String categoryId, AdminCategoryRequest request) {
		ProductCategoryEntity existingCategory = requireCategory(categoryId);
		validateUniqueCategorySlug(request.slug(), categoryId);
		existingCategory.setSlug(request.slug());
		existingCategory.setNameVi(request.name());
		existingCategory.setNameEn(withFallback(request.nameEn(), request.name()));
		existingCategory.setNameZh(withFallback(request.nameZh(), request.nameEn(), request.name()));
		existingCategory.setDescriptionVi(request.description());
		existingCategory.setDescriptionEn(withFallback(request.descriptionEn(), request.description()));
		existingCategory.setDescriptionZh(withFallback(request.descriptionZh(), request.descriptionEn(), request.description()));
		existingCategory.setActive(!Boolean.FALSE.equals(request.active()));
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
		scheduleGalleryDeletes(request.deletedGalleryImages(), resolveGallery(product));
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
		ProductEntity savedProduct = productRepository.save(existingProduct);
		scheduleGalleryDeletes(request.deletedGalleryImages(), resolveGallery(savedProduct));
		return mapAdminProduct(savedProduct);
	}

	public synchronized void deleteProduct(String productId) {
		ProductEntity product = requireProduct(productId);
		scheduleCloudinaryDeletes(resolveGallery(product));
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
					"请提交产品、包装和出货需求，FortisVN 将尽快回复。",
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
					"Share your crop, packing and shipment requirements so FortisVN can respond quickly.",
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
				"Gửi nhanh nhu cầu về mặt hàng, quy cách đóng gói và lịch giao để đội ngũ FortisVN phản hồi.",
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
				localizedText(locale, category.getNameVi(), category.getNameEn(), category.getNameZh()),
				localizedText(locale, category.getDescriptionVi(), category.getDescriptionEn(), category.getDescriptionZh())
		);
	}

	private ProductCatalogResponse.ProductItem mapPublicProduct(ProductEntity product, String locale) {
		return new ProductCatalogResponse.ProductItem(
				product.getId(),
				product.getSlug(),
				product.getCategory().getId(),
				localizedText(locale, product.getCategory().getNameVi(), product.getCategory().getNameEn(), product.getCategory().getNameZh()),
				localizedText(locale, product.getNameVi(), product.getNameEn(), product.getNameZh()),
				localizedText(locale, product.getSummaryVi(), product.getSummaryEn(), product.getSummaryZh()),
				localizedText(locale, product.getDetailDescriptionVi(), product.getDetailDescriptionEn(), product.getDetailDescriptionZh()),
				product.getHsCode(),
				product.getPackagingSpec(),
				product.getImageUrl(),
				product.getSpecificationFileUrl(),
				resolveGallery(product),
				localizedSpecifications(product, locale),
				localizedApplications(locale, product),
				localizedSpecGroup(product.getHighlights(), locale),
				localizedSpecGroup(product.getQualityControlSteps(), locale),
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
				category.getNameEn(),
				category.getNameZh(),
				category.getDescriptionVi(),
				category.getDescriptionEn(),
				category.getDescriptionZh(),
				category.isActive()
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
				product.getDetailDescriptionVi(),
				product.getDetailDescriptionEn(),
				product.getDetailDescriptionZh(),
				product.getHsCode(),
				product.getPackagingSpec(),
				product.getImageUrl(),
				product.getSpecificationFileUrl(),
				resolveGallery(product),
				List.copyOf(product.getApplicationsVi()),
				List.copyOf(product.getApplicationsEn()),
				List.copyOf(product.getApplicationsZh()),
				adminSpecifications(product),
				adminSpecGroup(product.getHighlights()),
				adminSpecGroup(product.getQualityControlSteps()),
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
		product.setDetailDescriptionVi(nullableTrim(request.detailDescription()));
		product.setDetailDescriptionEn(nullableTrim(withFallback(request.detailDescriptionEn(), request.detailDescription())));
		product.setDetailDescriptionZh(nullableTrim(withFallback(request.detailDescriptionZh(), request.detailDescriptionEn(), request.detailDescription())));
		product.setHsCode(nullableTrim(request.hsCode()));
		product.setPackagingSpec(nullableTrim(request.packagingSpec()));
		List<String> galleryImages = resolveGalleryImages(request.galleryImages(), image, existingProduct);
		product.setGalleryImageUrls(galleryImages);
		product.setImageUrl(galleryImages.isEmpty() ? DEFAULT_PRODUCT_IMAGE : galleryImages.getFirst());
		product.setSpecificationFileUrl(resolveSpecificationUrl(specificationFile, existingProduct));
		product.setApplicationsVi(normalizeList(request.applications()));
		product.setApplicationsEn(normalizeListWithFallback(request.applicationsEn(), request.applications()));
		product.setApplicationsZh(normalizeListWithFallback(request.applicationsZh(), request.applicationsEn(), request.applications()));
		List<ProductSpecificationValue> specifications = normalizeSpecifications(request.specifications());
		product.setSpecifications(specifications);
		product.setHighlights(normalizeOptionalSpecificationGroup(request.highlights()));
		product.setQualityControlSteps(normalizeOptionalSpecificationGroup(request.qualityControlSteps()));
		syncLegacySpecificationColumns(product, specifications);
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

	private List<ProductCatalogResponse.TechnicalSpecificationItem> localizedSpecifications(ProductEntity product, String locale) {
		return specificationValues(product).stream()
				.map(spec -> localizedSpecItem(spec, locale))
				.filter(spec -> !spec.label().isBlank() && !spec.value().isBlank())
				.toList();
	}

	private List<ProductCatalogResponse.TechnicalSpecificationItem> localizedSpecGroup(List<ProductSpecificationValue> values, String locale) {
		return values.stream()
				.sorted(java.util.Comparator.comparingInt(ProductSpecificationValue::getSortOrder))
				.map(spec -> localizedSpecItem(spec, locale))
				.filter(spec -> !spec.label().isBlank() && !spec.value().isBlank())
				.toList();
	}

	private ProductCatalogResponse.TechnicalSpecificationItem localizedSpecItem(ProductSpecificationValue spec, String locale) {
		return new ProductCatalogResponse.TechnicalSpecificationItem(
				localizedText(locale, spec.getLabelVi(), spec.getLabelEn(), spec.getLabelZh()),
				localizedText(locale, spec.getValueVi(), spec.getValueEn(), spec.getValueZh())
		);
	}

	private List<AdminCatalogResponse.TechnicalSpecificationItem> adminSpecifications(ProductEntity product) {
		return specificationValues(product).stream()
				.map(this::adminSpecItem)
				.toList();
	}

	private List<AdminCatalogResponse.TechnicalSpecificationItem> adminSpecGroup(List<ProductSpecificationValue> values) {
		return values.stream()
				.sorted(java.util.Comparator.comparingInt(ProductSpecificationValue::getSortOrder))
				.map(this::adminSpecItem)
				.toList();
	}

	private AdminCatalogResponse.TechnicalSpecificationItem adminSpecItem(ProductSpecificationValue spec) {
		return new AdminCatalogResponse.TechnicalSpecificationItem(
				spec.getLabelVi(),
				spec.getLabelEn(),
				spec.getLabelZh(),
				spec.getValueVi(),
				spec.getValueEn(),
				spec.getValueZh()
		);
	}

/* old
				.map(spec -> new ProductCatalogResponse.TechnicalSpecificationItem(
						localizedText(locale, spec.getLabelVi(), spec.getLabelEn(), spec.getLabelZh()),
						localizedText(locale, spec.getValueVi(), spec.getValueEn(), spec.getValueZh())
				))
				.filter(spec -> !spec.label().isBlank() && !spec.value().isBlank())
				.toList();
	}

	private List<AdminCatalogResponse.TechnicalSpecificationItem> adminSpecifications(ProductEntity product) {
		return specificationValues(product).stream()
				.map(spec -> new AdminCatalogResponse.TechnicalSpecificationItem(
						spec.getLabelVi(),
						spec.getLabelEn(),
						spec.getLabelZh(),
						spec.getValueVi(),
						spec.getValueEn(),
						spec.getValueZh()
				))
				.toList();
	}
*/

	private List<ProductSpecificationValue> specificationValues(ProductEntity product) {
		if (!product.getSpecifications().isEmpty()) {
			return product.getSpecifications().stream()
					.sorted(java.util.Comparator.comparingInt(ProductSpecificationValue::getSortOrder))
					.toList();
		}

		List<ProductSpecificationValue> legacy = List.of(
				legacySpecification(0, "Quy cách đóng gói", "Packing format", "包装规格", product.getThickness(), product.getThicknessEn(), product.getThicknessZh()),
				legacySpecification(1, "Tiêu chuẩn chất lượng", "Quality standard", "质量标准", product.getMoisture(), product.getMoistureEn(), product.getMoistureZh()),
				legacySpecification(2, "Xuất xứ / Chứng nhận", "Origin / certification", "产地 / 认证", product.getGlueType(), product.getGlueTypeEn(), product.getGlueTypeZh()),
				legacySpecification(3, "Khối lượng / Quy cách carton", "Net weight / carton", "净重 / 箱规", product.getSize(), product.getSizeEn(), product.getSizeZh())
		);
		return legacy.stream().filter(spec -> spec.getValueVi() != null && !spec.getValueVi().isBlank()).toList();
	}

	private ProductSpecificationValue legacySpecification(
			int sortOrder,
			String labelVi,
			String labelEn,
			String labelZh,
			String valueVi,
			String valueEn,
			String valueZh
	) {
		ProductSpecificationValue spec = new ProductSpecificationValue();
		spec.setSortOrder(sortOrder);
		spec.setLabelVi(labelVi);
		spec.setLabelEn(labelEn);
		spec.setLabelZh(labelZh);
		spec.setValueVi(valueVi);
		spec.setValueEn(valueEn);
		spec.setValueZh(valueZh);
		return spec;
	}

	private List<ProductSpecificationValue> normalizeSpecifications(List<AdminProductUpsertRequest.TechnicalSpecificationItem> requestSpecs) {
		if (requestSpecs == null) {
			return List.of();
		}
		java.util.ArrayList<ProductSpecificationValue> specs = new java.util.ArrayList<>();
		for (int index = 0; index < requestSpecs.size(); index++) {
			AdminProductUpsertRequest.TechnicalSpecificationItem item = requestSpecs.get(index);
			String labelVi = withFallback(item.label());
			String valueVi = withFallback(item.value());
			if (labelVi.isBlank() || valueVi.isBlank()) {
				continue;
			}
			ProductSpecificationValue spec = new ProductSpecificationValue();
			spec.setSortOrder(index);
			spec.setLabelVi(labelVi);
			spec.setLabelEn(withFallback(item.labelEn(), item.label()));
			spec.setLabelZh(withFallback(item.labelZh(), item.labelEn(), item.label()));
			spec.setValueVi(valueVi);
			spec.setValueEn(withFallback(item.valueEn(), item.value()));
			spec.setValueZh(withFallback(item.valueZh(), item.valueEn(), item.value()));
			specs.add(spec);
		}
		return specs;
	}

	private List<ProductSpecificationValue> normalizeOptionalSpecificationGroup(List<AdminProductUpsertRequest.TechnicalSpecificationItem> requestSpecs) {
		if (requestSpecs == null) {
			return List.of();
		}
		return normalizeSpecifications(requestSpecs);
	}

	private void syncLegacySpecificationColumns(ProductEntity product, List<ProductSpecificationValue> specifications) {
		ProductSpecificationValue first = specifications.isEmpty() ? legacySpecification(0, "Quy cách đóng gói", "Packing format", "包装规格", "", "", "") : specifications.getFirst();
		ProductSpecificationValue second = specifications.size() > 1 ? specifications.get(1) : first;
		ProductSpecificationValue third = specifications.size() > 2 ? specifications.get(2) : first;
		ProductSpecificationValue fourth = specifications.size() > 3 ? specifications.get(3) : first;
		product.setThickness(first.getValueVi());
		product.setThicknessEn(first.getValueEn());
		product.setThicknessZh(first.getValueZh());
		product.setMoisture(second.getValueVi());
		product.setMoistureEn(second.getValueEn());
		product.setMoistureZh(second.getValueZh());
		product.setGlueType(third.getValueVi());
		product.setGlueTypeEn(third.getValueEn());
		product.setGlueTypeZh(third.getValueZh());
		product.setSize(fourth.getValueVi());
		product.setSizeEn(fourth.getValueEn());
		product.setSizeZh(fourth.getValueZh());
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

	private void scheduleGalleryDeletes(List<String> requestedDeletes, List<String> currentGallery) {
		List<String> keepSet = normalizeList(currentGallery);
		List<String> pendingDeletes = normalizeList(requestedDeletes).stream()
				.filter(url -> !keepSet.contains(url))
				.toList();
		scheduleCloudinaryDeletes(pendingDeletes);
	}

	private void scheduleCloudinaryDeletes(List<String> imageUrls) {
		List<String> urls = normalizeList(imageUrls);
		if (urls.isEmpty()) {
			return;
		}

		Runnable deleteTask = () -> urls.forEach(cloudinaryService::deleteByUrl);
		if (TransactionSynchronizationManager.isSynchronizationActive()) {
			TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
				@Override
				public void afterCommit() {
					deleteTask.run();
				}
			});
			return;
		}
		deleteTask.run();
	}

	private String uploadImageToCloudinary(MultipartFile image) {
		Object secureUrl = cloudinaryService.upload(image).get("secure_url");
		if (secureUrl == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cloudinary upload did not return a secure URL");
		}
		return secureUrl.toString();
	}

	private String nullableTrim(String value) {
		if (value == null || value.isBlank()) {
			return null;
		}
		return value.trim();
	}

	private String resolveSpecificationUrl(MultipartFile specificationFile, ProductEntity existingProduct) {
		if (specificationFile == null || specificationFile.isEmpty()) {
			return existingProduct == null ? null : existingProduct.getSpecificationFileUrl();
		}
		return fileStorageService.store(specificationFile, "products/specifications");
	}
}
