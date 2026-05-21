package vn.fortis.website.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import vn.fortis.website.dto.home.HomePageResponse;
import vn.fortis.website.entity.ProductEntity;
import vn.fortis.website.entity.ProductSpecificationValue;
import vn.fortis.website.repository.ProductRepository;
import vn.fortis.website.service.content.ContentManagementService;
import vn.fortis.website.service.content.ContentManagementService.BannerRecord;
import vn.fortis.website.service.content.ContentManagementService.ContentSnapshot;

@Service
@Transactional(readOnly = true)
public class HomeContentService {

	private final ContentManagementService contentManagementService;
	private final ProductRepository productRepository;

	public HomeContentService(
			ContentManagementService contentManagementService,
			ProductRepository productRepository
	) {
		this.contentManagementService = contentManagementService;
		this.productRepository = productRepository;
	}

	public HomePageResponse getHomePage(String lang) {
		String locale = normalizeLocale(lang);
		boolean english = "en".equals(locale);
		boolean chinese = "zh".equals(locale);
		boolean useEnglishContent = english || chinese;
		ContentSnapshot contentSnapshot = contentManagementService.getSnapshot();

		return new HomePageResponse(
				locale,
				new HomePageResponse.CompanyInfo(
						"Công ty TNHH Fortis VN",
						"Fortis VN Co., Ltd.",
						"FORTIS VN",
						chinese
								? "可靠、透明、符合出口需求的农产品解决方案。"
								: english
								? "Reliable, transparent and export-ready agricultural product solutions."
								: "Giải pháp nông sản xuất khẩu ổn định, minh bạch và đúng chuẩn.",
						chinese ? "查看精选产品" : english ? "View featured products" : "Xem sản phẩm chủ lực",
						chinese ? "查看认证" : english ? "See certificates" : "Khám phá chứng chỉ",
						contentSnapshot.address(),
						contentSnapshot.hotline(),
						contentSnapshot.email()
				),
				chinese
						? textWithFallback(contentSnapshot.aboutArticleZh(), contentSnapshot.aboutArticleEn(), contentSnapshot.aboutArticleVi())
						: useEnglishContent ? contentSnapshot.aboutArticleEn() : contentSnapshot.aboutArticleVi(),
				buildHeroSlides(contentSnapshot.banners(), locale),
				buildCoreValuesSection(locale),
				buildCoreValues(locale),
				buildFeaturedProductsSection(locale),
				buildFeaturedProducts(locale),
				buildCredentialsSection(locale),
				buildCertificates(locale),
				buildPartners()
		);
	}

	private String normalizeLocale(String lang) {
		if ("zh".equalsIgnoreCase(lang) || "cn".equalsIgnoreCase(lang) || "zh-cn".equalsIgnoreCase(lang)) {
			return "zh";
		}
		return "en".equalsIgnoreCase(lang) ? "en" : "vi";
	}

	private List<HomePageResponse.HeroSlide> buildHeroSlides(List<BannerRecord> banners, String locale) {
		boolean english = "en".equals(locale);
		boolean chinese = "zh".equals(locale);
		return List.of(
				mapBanner(
						banners.get(0),
						locale,
						chinese ? "精选产区" : english ? "Selected growing regions" : "Vùng trồng tuyển chọn",
						List.of(
								new HomePageResponse.FactItem(chinese ? "可追溯" : "Traceability", chinese ? "产地批次" : "Farm lots"),
								new HomePageResponse.FactItem(chinese ? "供应" : "Supply", chinese ? "季节计划" : "Seasonal planning"),
								new HomePageResponse.FactItem(chinese ? "出口" : "Export", chinese ? "多市场" : "Multi-market")
						)
				),
				mapBanner(
						banners.get(1),
						locale,
						chinese ? "出口协调" : english ? "Export coordination" : "Điều phối xuất khẩu",
						List.of(
								new HomePageResponse.FactItem("Incoterms", "FOB / CIF"),
								new HomePageResponse.FactItem(chinese ? "冷链" : "Cold chain", chinese ? "计划流程" : "Planned flow"),
								new HomePageResponse.FactItem(chinese ? "文件" : "Documents", chinese ? "B2B 支持" : "B2B support")
						)
				),
				mapBanner(
						banners.get(2),
						locale,
						chinese ? "包装能力" : english ? "Packing capability" : "Sơ chế và đóng gói",
						List.of(
								new HomePageResponse.FactItem(chinese ? "质量" : "Quality", chinese ? "分级控制" : "Grading control"),
								new HomePageResponse.FactItem(chinese ? "新鲜度" : "Freshness", chinese ? "快速处理" : "Handled quickly"),
								new HomePageResponse.FactItem(chinese ? "包装" : "Packing", chinese ? "买家规格" : "Buyer specs")
						)
				)
		);
	}

	private HomePageResponse.HeroSlide mapBanner(BannerRecord banner, String locale, String eyebrow, List<HomePageResponse.FactItem> facts) {
		boolean english = "en".equals(locale);
		boolean chinese = "zh".equals(locale);
		return new HomePageResponse.HeroSlide(
				eyebrow,
				chinese
						? textWithFallback(banner.titleZh(), banner.titleEn(), banner.titleVi())
						: english ? banner.titleEn() : banner.titleVi(),
				chinese
						? textWithFallback(banner.descriptionZh(), banner.descriptionEn(), banner.descriptionVi())
						: english ? banner.descriptionEn() : banner.descriptionVi(),
				banner.imageUrl(),
				banner.overlayLabel(),
				facts
		);
	}

	private HomePageResponse.SectionHeader buildCoreValuesSection(String locale) {
		if ("zh".equals(locale)) {
			return new HomePageResponse.SectionHeader(
					"核心价值",
					"Fortis VN 与国际客户建立长期出口合作的基础。",
					"首页采用组件化 UI 与 API-ready 结构，便于后续扩展 CMS、农产品目录、公司资料和询价流程。"
			);
		}
		return "en".equals(locale)
				? new HomePageResponse.SectionHeader(
						"Core values",
						"The principles behind a long-term export partnership with Fortis VN.",
						"The homepage is built with a componentized UI and API-ready structure so a CMS, agricultural catalogue, company profile and RFQ flows can be added later."
				)
				: new HomePageResponse.SectionHeader(
						"Giá trị cốt lõi",
						"Nền tảng để Fortis VN làm việc bền vững với khách hàng quốc tế.",
						"Trang chủ được xây theo mô hình component + API để sau này bổ sung CMS, danh mục nông sản, hồ sơ năng lực và form RFQ dễ dàng hơn."
				);
	}

	private List<HomePageResponse.CoreValue> buildCoreValues(String locale) {
		if ("zh".equals(locale)) {
			return List.of(
					new HomePageResponse.CoreValue("国际质量标准", "根据目标市场要求控制包装规格、新鲜度、分级和出口文件。", "01"),
					new HomePageResponse.CoreValue("稳定供应能力", "聚焦柚子、香蕉、椰子及椰子加工品等具备重复需求的农产品。", "02"),
					new HomePageResponse.CoreValue("有竞争力的价格", "优化采购与物流，在成本、可靠性和交付时间之间取得平衡。", "03"),
					new HomePageResponse.CoreValue("快速响应 B2B 订单", "系统结构可扩展为报价流程、产品目录和内容管理。", "04")
			);
		}
		return "en".equals(locale)
				? List.of(
						new HomePageResponse.CoreValue("International quality standards", "Control over packing format, freshness, grading and export documentation for each target market.", "01"),
						new HomePageResponse.CoreValue("Stable supply capacity", "Focused on repeat-demand agricultural products such as pomelo, banana, coconut and coconut-based processed goods.", "02"),
						new HomePageResponse.CoreValue("Competitive pricing", "Optimized sourcing and logistics to balance cost, reliability and on-time delivery.", "03"),
						new HomePageResponse.CoreValue("Fast response for B2B orders", "The structure is ready to grow into quotation workflows, product catalogs and content management.", "04")
				)
				: List.of(
						new HomePageResponse.CoreValue("Chất lượng đạt chuẩn quốc tế", "Kiểm soát quy cách đóng gói, độ tươi, phân loại và chứng từ theo yêu cầu của từng nhóm thị trường xuất khẩu.", "01"),
						new HomePageResponse.CoreValue("Nguồn cung ổn định", "Tập trung vào các mặt hàng nông sản có nhu cầu lặp lại cao như bưởi, chuối, dừa và sản phẩm chế biến từ dừa.", "02"),
						new HomePageResponse.CoreValue("Giá cả cạnh tranh", "Tối ưu từ sourcing đến vận chuyển để cân bằng giữa chi phí, độ tin cậy và tiến độ giao hàng.", "03"),
						new HomePageResponse.CoreValue("Phản hồi nhanh cho đơn hàng B2B", "Cấu trúc tổ chức nội dung và API sẵn sàng để mở rộng thành hệ thống báo giá, catalog và quản trị dữ liệu sản phẩm.", "04")
				);
	}

	private HomePageResponse.SectionHeader buildFeaturedProductsSection(String locale) {
		if ("zh".equals(locale)) {
			return new HomePageResponse.SectionHeader(
					"精选产品",
					"重点产品阵容让买家快速了解贸易能力。",
					"由 Fortis VN 管理团队选择并展示给首页访客的产品。"
			);
		}
		return "en".equals(locale)
				? new HomePageResponse.SectionHeader(
						"Featured products",
						"A focused product lineup that immediately shows trading capability.",
						"Selected products curated by the Fortis VN admin team for buyers visiting the homepage."
				)
				: new HomePageResponse.SectionHeader(
						"Sản phẩm tiêu biểu",
						"Nhóm sản phẩm chủ lực để khách truy cập thấy ngay năng lực thương mại.",
						"Các sản phẩm được đội ngũ Fortis VN chọn hiển thị nổi bật trên trang chủ."
				);
	}

	private List<HomePageResponse.ProductHighlight> buildFeaturedProducts(String locale) {
		return productRepository.findByActiveTrueAndFeaturedTrueOrderByCreatedAtAsc().stream()
				.limit(4)
				.map(product -> mapFeaturedProduct(product, locale))
				.toList();
	}

	private HomePageResponse.ProductHighlight mapFeaturedProduct(ProductEntity product, String locale) {
		boolean english = "en".equals(locale);
		boolean chinese = "zh".equals(locale);
		return new HomePageResponse.ProductHighlight(
				product.getSlug(),
				chinese
						? textWithFallback(product.getNameZh(), product.getNameEn(), product.getNameVi())
						: english ? textWithFallback(product.getNameEn(), product.getNameVi(), product.getNameZh()) : textWithFallback(product.getNameVi(), product.getNameEn(), product.getNameZh()),
				chinese
						? textWithFallback(product.getCategory().getNameZh(), product.getCategory().getNameEn(), product.getCategory().getNameVi())
						: english ? textWithFallback(product.getCategory().getNameEn(), product.getCategory().getNameVi(), product.getCategory().getNameZh()) : textWithFallback(product.getCategory().getNameVi(), product.getCategory().getNameEn(), product.getCategory().getNameZh()),
				chinese
						? textWithFallback(product.getSummaryZh(), product.getSummaryEn(), product.getSummaryVi())
						: english ? textWithFallback(product.getSummaryEn(), product.getSummaryVi(), product.getSummaryZh()) : textWithFallback(product.getSummaryVi(), product.getSummaryEn(), product.getSummaryZh()),
				product.getImageUrl(),
				localizedSpecifications(product, locale),
				localizedApplications(product, locale)
		);
	}

	private List<HomePageResponse.ProductFact> localizedSpecifications(ProductEntity product, String locale) {
		return specificationValues(product).stream()
				.map(spec -> new HomePageResponse.ProductFact(
						localizedText(locale, spec.getLabelVi(), spec.getLabelEn(), spec.getLabelZh()),
						localizedText(locale, spec.getValueVi(), spec.getValueEn(), spec.getValueZh())
				))
				.filter(spec -> !spec.label().isBlank() && !spec.value().isBlank())
				.toList();
	}

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

	private List<String> localizedApplications(ProductEntity product, String locale) {
		return switch (locale) {
			case "en" -> listWithFallback(product.getApplicationsEn(), product.getApplicationsVi(), product.getApplicationsZh());
			case "zh" -> listWithFallback(product.getApplicationsZh(), product.getApplicationsEn(), product.getApplicationsVi());
			default -> listWithFallback(product.getApplicationsVi(), product.getApplicationsEn(), product.getApplicationsZh());
		};
	}

	@SafeVarargs
	private final List<String> listWithFallback(List<String>... candidates) {
		for (List<String> candidate : candidates) {
			List<String> normalized = normalizeList(candidate);
			if (!normalized.isEmpty()) {
				return normalized;
			}
		}
		return List.of();
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

	private String localizedText(String locale, String vi, String en, String zh) {
		return switch (locale) {
			case "en" -> textWithFallback(en, vi, zh);
			case "zh" -> textWithFallback(zh, en, vi);
			default -> textWithFallback(vi, en, zh);
		};
	}

	private String textWithFallback(String primary, String secondary, String tertiary) {
		if (primary != null && !primary.isBlank()) {
			return primary;
		}
		if (secondary != null && !secondary.isBlank()) {
			return secondary;
		}
		return tertiary == null ? "" : tertiary;
	}

	private HomePageResponse.SectionHeader buildCredentialsSection(String locale) {
		if ("zh".equals(locale)) {
			return new HomePageResponse.SectionHeader(
					"认证与合作伙伴",
					"以合规展示和市场连接提升买家信任。",
					"该区域以徽章/标识形式设计，后续可接入真实品牌资产和证书详情页。"
			);
		}
		return "en".equals(locale)
				? new HomePageResponse.SectionHeader(
						"Certificates and partners",
						"Build trust early with compliance visibility and market connectivity.",
						"This area is designed as a badge/logo zone so real brand assets and deeper certificate pages can be plugged in later."
				)
				: new HomePageResponse.SectionHeader(
						"Chứng chỉ và đối tác",
						"Tăng niềm tin ngay ở màn hình đầu bằng năng lực tuân thủ và kết nối thị trường.",
						"Khu vực này được thiết kế dạng badge/logo để sau này thay bằng logo thật hoặc liên kết tới trang chứng chỉ chi tiết."
				);
	}

	private List<HomePageResponse.CredentialBadge> buildCertificates(String locale) {
		if ("zh".equals(locale)) {
			return List.of(
					new HomePageResponse.CredentialBadge("GlobalG.A.P.", "支持良好农业实践和面向出口的种植项目。"),
					new HomePageResponse.CredentialBadge("VietGAP", "支持国内农场追溯和种植控制。"),
					new HomePageResponse.CredentialBadge("HACCP", "用于包装和加工农产品的食品安全控制。"),
					new HomePageResponse.CredentialBadge("CO/CQ", "根据进口商要求准备商业与质量文件。")
			);
		}
		return "en".equals(locale)
				? List.of(
						new HomePageResponse.CredentialBadge("GlobalG.A.P.", "Supports good agricultural practices and export-oriented farm programs."),
						new HomePageResponse.CredentialBadge("VietGAP", "Supports domestic farm traceability and cultivation control."),
						new HomePageResponse.CredentialBadge("HACCP", "Food-safety control for packed and processed agricultural products."),
						new HomePageResponse.CredentialBadge("CO/CQ", "Commercial and quality documents prepared for importer requirements.")
				)
				: List.of(
						new HomePageResponse.CredentialBadge("GlobalG.A.P.", "Định hướng vùng trồng và thực hành nông nghiệp tốt cho các lô xuất khẩu."),
						new HomePageResponse.CredentialBadge("VietGAP", "Hỗ trợ truy xuất nguồn gốc và kiểm soát canh tác trong nước."),
						new HomePageResponse.CredentialBadge("HACCP", "Kiểm soát an toàn thực phẩm cho sản phẩm sơ chế và chế biến."),
						new HomePageResponse.CredentialBadge("CO/CQ", "Chuẩn bị chứng từ thương mại theo yêu cầu của đối tác nhập khẩu.")
				);
	}

	private List<HomePageResponse.PartnerBadge> buildPartners() {
		return List.of(
				new HomePageResponse.PartnerBadge("China", "Fresh fruit importers"),
				new HomePageResponse.PartnerBadge("Japan", "Retail and food-service buyers"),
				new HomePageResponse.PartnerBadge("Korea", "Premium produce distributors"),
				new HomePageResponse.PartnerBadge("Middle East", "Wholesale and trading network")
		);
	}
}
