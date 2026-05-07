package vn.fortis.website.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import vn.fortis.website.dto.home.HomePageResponse;
import vn.fortis.website.entity.ProductEntity;
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
		String locale = "en".equalsIgnoreCase(lang) ? "en" : "vi";
		boolean english = "en".equals(locale);
		ContentSnapshot contentSnapshot = contentManagementService.getSnapshot();

		return new HomePageResponse(
				locale,
				new HomePageResponse.CompanyInfo(
						"Công ty TNHH Fortis VN",
						"Fortis VN Co., Ltd.",
						"FORTIS VN",
						english
								? "Reliable, transparent and export-ready agricultural product solutions."
								: "Giải pháp nông sản xuất khẩu ổn định, minh bạch và đúng chuẩn.",
						english ? "View featured products" : "Xem sản phẩm chủ lực",
						english ? "See certificates" : "Khám phá chứng chỉ",
						contentSnapshot.address(),
						contentSnapshot.hotline(),
						contentSnapshot.email()
				),
				english ? contentSnapshot.aboutArticleEn() : contentSnapshot.aboutArticleVi(),
				buildHeroSlides(contentSnapshot.banners(), english),
				buildCoreValuesSection(english),
				buildCoreValues(english),
				buildFeaturedProductsSection(english),
				buildFeaturedProducts(english),
				buildCredentialsSection(english),
				buildCertificates(english),
				buildPartners()
		);
	}

	private List<HomePageResponse.HeroSlide> buildHeroSlides(List<BannerRecord> banners, boolean english) {
		return List.of(
				mapBanner(
						banners.get(0),
						english,
						english ? "Selected growing regions" : "Vùng trồng tuyển chọn",
						List.of(
								new HomePageResponse.FactItem("Traceability", "Farm lots"),
								new HomePageResponse.FactItem("Supply", "Seasonal planning"),
								new HomePageResponse.FactItem("Export", "Multi-market")
						)
				),
				mapBanner(
						banners.get(1),
						english,
						english ? "Export coordination" : "Điều phối xuất khẩu",
						List.of(
								new HomePageResponse.FactItem("Incoterms", "FOB / CIF"),
								new HomePageResponse.FactItem("Cold chain", "Planned flow"),
								new HomePageResponse.FactItem("Documents", "B2B support")
						)
				),
				mapBanner(
						banners.get(2),
						english,
						english ? "Packing capability" : "Sơ chế và đóng gói",
						List.of(
								new HomePageResponse.FactItem("Quality", "Grading control"),
								new HomePageResponse.FactItem("Freshness", "Handled quickly"),
								new HomePageResponse.FactItem("Packing", "Buyer specs")
						)
				)
		);
	}

	private HomePageResponse.HeroSlide mapBanner(BannerRecord banner, boolean english, String eyebrow, List<HomePageResponse.FactItem> facts) {
		return new HomePageResponse.HeroSlide(
				eyebrow,
				english ? banner.titleEn() : banner.titleVi(),
				english ? banner.descriptionEn() : banner.descriptionVi(),
				banner.imageUrl(),
				banner.overlayLabel(),
				facts
		);
	}

	private HomePageResponse.SectionHeader buildCoreValuesSection(boolean english) {
		return english
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

	private List<HomePageResponse.CoreValue> buildCoreValues(boolean english) {
		return english
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

	private HomePageResponse.SectionHeader buildFeaturedProductsSection(boolean english) {
		return english
				? new HomePageResponse.SectionHeader(
						"Featured products",
						"A focused product lineup that immediately shows trading capability.",
						"This list is currently seed data, but it already flows through the backend API so future content changes will not require UI rewrites."
				)
				: new HomePageResponse.SectionHeader(
						"Sản phẩm tiêu biểu",
						"Nhóm sản phẩm chủ lực để khách truy cập thấy ngay năng lực thương mại.",
						"Danh sách hiện là seed data nhưng đã đi qua lớp API backend để về sau chỉ cần thay nguồn dữ liệu, không cần sửa lại giao diện."
				);
	}

	private List<HomePageResponse.ProductHighlight> buildFeaturedProducts(boolean english) {
		return productRepository.findByActiveTrueOrderByCreatedAtAsc().stream()
				.limit(6)
				.map(product -> mapFeaturedProduct(product, english))
				.toList();
	}

	private HomePageResponse.ProductHighlight mapFeaturedProduct(ProductEntity product, boolean english) {
		String primaryUse = english
				? product.getApplicationsEn().stream().findFirst().orElse("General use")
				: product.getApplicationsVi().stream().findFirst().orElse("Ung dung chung");
		return new HomePageResponse.ProductHighlight(
				english ? product.getNameEn() : product.getNameVi(),
				english ? product.getCategory().getNameEn() : product.getCategory().getNameVi(),
				english ? product.getSummaryEn() : product.getSummaryVi(),
				product.getThickness(),
				primaryUse
		);
	}

	private HomePageResponse.SectionHeader buildCredentialsSection(boolean english) {
		return english
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

	private List<HomePageResponse.CredentialBadge> buildCertificates(boolean english) {
		return english
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
