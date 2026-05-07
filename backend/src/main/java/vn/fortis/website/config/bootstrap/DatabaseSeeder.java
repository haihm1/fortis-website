package vn.fortis.website.config.bootstrap;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import vn.fortis.website.entity.AdminAccountEntity;
import vn.fortis.website.entity.ContentProfileEntity;
import vn.fortis.website.entity.HomeBannerEntity;
import vn.fortis.website.entity.ProductCategoryEntity;
import vn.fortis.website.entity.ProductEntity;
import vn.fortis.website.repository.AdminAccountRepository;
import vn.fortis.website.repository.ContentProfileRepository;
import vn.fortis.website.repository.HomeBannerRepository;
import vn.fortis.website.repository.ProductCategoryRepository;
import vn.fortis.website.repository.ProductRepository;

@Configuration
public class DatabaseSeeder {

	@Bean
	ApplicationRunner seedDatabase(
			AdminAccountRepository adminAccountRepository,
			ContentProfileRepository contentProfileRepository,
			HomeBannerRepository homeBannerRepository,
			ProductCategoryRepository productCategoryRepository,
			ProductRepository productRepository,
			PasswordEncoder passwordEncoder,
			@Value("${app.company.default-address}") String defaultAddress,
			@Value("${app.company.default-hotline}") String defaultHotline,
			@Value("${app.company.default-email}") String defaultEmail
	) {
		return args -> {
			seedAccounts(adminAccountRepository, passwordEncoder);
			seedContent(contentProfileRepository, homeBannerRepository, defaultAddress, defaultHotline, defaultEmail);
			seedCatalog(productCategoryRepository, productRepository);
		};
	}

	private void seedAccounts(AdminAccountRepository repository, PasswordEncoder passwordEncoder) {
		if (repository.count() > 0) {
			return;
		}

		AdminAccountEntity superAdmin = new AdminAccountEntity();
		superAdmin.setId("super-admin");
		superAdmin.setUsername("admin");
		superAdmin.setDisplayName("System Administrator");
		superAdmin.setEmail("admin@fortisvn.vn");
		superAdmin.setActive(true);
		superAdmin.setPasswordHash(passwordEncoder.encode("Admin@123"));
		superAdmin.setRoles(new java.util.LinkedHashSet<>(
				List.of("SUPER_ADMIN", "CONTENT_PUBLISHER", "CONTACT_MANAGER", "ACCOUNT_MANAGER")
		));

		AdminAccountEntity editor = new AdminAccountEntity();
		editor.setId("content-editor");
		editor.setUsername("editor");
		editor.setDisplayName("Content Editor");
		editor.setEmail("editor@fortisvn.vn");
		editor.setActive(true);
		editor.setPasswordHash(passwordEncoder.encode("Editor@123"));
		editor.setRoles(new java.util.LinkedHashSet<>(List.of("CONTENT_EDITOR", "CONTENT_PUBLISHER")));

		repository.saveAll(List.of(superAdmin, editor));
	}

	private void seedContent(
			ContentProfileRepository contentProfileRepository,
			HomeBannerRepository homeBannerRepository,
			String defaultAddress,
			String defaultHotline,
			String defaultEmail
	) {
		if (contentProfileRepository.count() == 0) {
			ContentProfileEntity profile = new ContentProfileEntity();
			profile.setId("main");
			profile.setAddress(defaultAddress);
			profile.setHotline(defaultHotline);
			profile.setEmail(defaultEmail);
			profile.setAboutArticleVi("""
					Fortis VN tập trung vào thương mại và kết nối chuỗi cung ứng cho các mặt hàng nông sản phục vụ xuất khẩu,
					trong đó ưu tiên vùng trồng ổn định, kiểm soát chất lượng và hỗ trợ tài liệu thương mại cho khách hàng B2B.
					""".strip());
			profile.setAboutArticleEn("""
					Fortis VN focuses on export-oriented agricultural trading and supply-chain coordination, prioritizing stable growing regions,
					quality control and commercial documentation support for B2B buyers.
					""".strip());
			contentProfileRepository.save(profile);
		}

		if (homeBannerRepository.count() > 0) {
			return;
		}

		homeBannerRepository.saveAll(List.of(
				buildBanner(
						1,
						"Kết nối nông sản Việt từ vùng trồng đến đơn hàng xuất khẩu.",
						"Linking Vietnamese agricultural products from farm lots to export orders.",
						"Fortis VN định vị như một đối tác thương mại nông sản đáng tin cậy với năng lực sourcing, kiểm soát chất lượng và tổ chức giao hàng theo yêu cầu từng thị trường.",
						"Fortis VN is positioned as a trusted agricultural trading partner with sourcing discipline, quality control and shipment coordination for international buyers.",
						"Selected growing regions",
						"https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80"
				),
				buildBanner(
						2,
						"Kết nối thu hoạch, sơ chế, đóng gói và logistics lạnh trong một quy trình xuyên suốt.",
						"Aligning harvest, packing, cold-chain handling and sea freight in a single flow.",
						"Cấu trúc vận hành được xây để phù hợp các đơn hàng B2B, giúp khách hàng quốc tế dễ dàng làm việc từ báo giá, xác nhận quy cách đóng gói đến lịch tàu.",
						"The operating model is designed for B2B orders, helping overseas customers move smoothly from quotation and packing confirmation to vessel planning.",
						"Fresh produce logistics",
						"https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1600&q=80"
				),
				buildBanner(
						3,
						"Phối hợp cùng nhà đóng gói để giữ độ tươi, đồng đều và đúng chuẩn xuất khẩu.",
						"Working with packing partners to keep products fresh, consistent and export-ready.",
						"Chúng tôi ưu tiên đối tác có tiêu chuẩn kiểm soát chất lượng rõ ràng, giúp sản phẩm phù hợp yêu cầu của nhà nhập khẩu, siêu thị và nhà phân phối.",
						"We prioritize partners with clear quality-control standards so each product line meets importer, supermarket and distributor requirements.",
						"Packing and quality control",
						"https://images.unsplash.com/photo-1589927986089-35812388d1f4?auto=format&fit=crop&w=1600&q=80"
				)
		));
	}

	private HomeBannerEntity buildBanner(
			int slot,
			String titleVi,
			String titleEn,
			String descriptionVi,
			String descriptionEn,
			String overlayLabel,
			String imageUrl
	) {
		HomeBannerEntity banner = new HomeBannerEntity();
		banner.setSlot(slot);
		banner.setTitleVi(titleVi);
		banner.setTitleEn(titleEn);
		banner.setDescriptionVi(descriptionVi);
		banner.setDescriptionEn(descriptionEn);
		banner.setOverlayLabel(overlayLabel);
		banner.setImageUrl(imageUrl);
		return banner;
	}

	private void seedCatalog(
			ProductCategoryRepository categoryRepository,
			ProductRepository productRepository
	) {
		if (categoryRepository.count() == 0) {
			categoryRepository.saveAll(List.of(
					buildCategory("fresh-fruits", "trai-cay-tuoi", "Trái cây tươi", "Fresh Fruits",
							"Bưởi, chuối và các dòng trái cây nhiệt đới đóng gói xuất khẩu.",
							"Pomelo, banana and tropical fruits packed for export programs."),
					buildCategory("fresh-coconut", "dua-tuoi", "Dừa tươi", "Fresh Coconut",
							"Dừa xiêm, dừa gọt kim cương và quy cách carton theo thị trường.",
							"Young coconut, diamond-cut coconut and market-specific carton formats."),
					buildCategory("processed-coconut", "san-pham-tu-dua", "Sản phẩm từ dừa", "Coconut Products",
							"Cơm dừa sấy, nước cốt dừa và nguyên liệu thực phẩm từ dừa.",
							"Desiccated coconut, coconut milk and coconut-based food ingredients."),
					buildCategory("oem-packing", "dong-goi-theo-yeu-cau", "Đóng gói theo yêu cầu", "OEM Packing",
							"Tổ hợp sản phẩm, nhãn riêng và quy cách đóng gói theo buyer spec.",
							"Private label, product combinations and buyer-specific packing formats.")
			));
		}

		if (productRepository.count() > 0) {
			return;
		}

		ProductCategoryEntity freshFruits = categoryRepository.findById("fresh-fruits").orElseThrow();
		ProductCategoryEntity freshCoconut = categoryRepository.findById("fresh-coconut").orElseThrow();
		ProductCategoryEntity processedCoconut = categoryRepository.findById("processed-coconut").orElseThrow();
		ProductCategoryEntity oemPacking = categoryRepository.findById("oem-packing").orElseThrow();

		productRepository.saveAll(List.of(
				buildProduct(
						"green-skin-pomelo", "buoi-da-xanh", freshFruits,
						"Bưởi da xanh", "Green skin pomelo",
						"Trái tuyển chọn theo size, vỏ xanh đều và vị ngọt thanh cho kênh nhập khẩu trái cây tươi.",
						"Selected fruit by size with consistent appearance and clean sweetness for fresh fruit importers.",
						"https://images.unsplash.com/photo-1577234286642-fc512a5f8f11?auto=format&fit=crop&w=1200&q=80",
						List.of("Siêu thị và cửa hàng trái cây cao cấp", "Nhà nhập khẩu trái cây tươi", "Kênh quà tặng theo mùa"),
						List.of("Supermarkets and premium fruit stores", "Fresh fruit importers", "Seasonal gift programs"),
						"9 - 12 trái / thùng", "Brix 10+ / trái đồng đều", "VietGAP / vùng Mekong", "12 - 15 kg / carton"
				),
				buildProduct(
						"cavendish-banana", "chuoi-cavendish", freshFruits,
						"Chuối Cavendish", "Cavendish banana",
						"Nguồn cung theo mùa vụ, đóng thùng carton và kiểm soát độ chín trước khi xuất.",
						"Seasonal supply with carton packing and ripeness control before export.",
						"https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&w=1200&q=80",
						List.of("Chuỗi bán lẻ và nhà phân phối trái cây", "Wholesale market", "Chương trình nhập khẩu định kỳ"),
						List.of("Retail chains and fruit distributors", "Wholesale market", "Recurring import programs"),
						"13 - 18 kg / carton", "Độ chín 3 - 4 khi đóng hàng", "VietGAP / GlobalG.A.P. ready", "Cluster / hand packed"
				),
				buildProduct(
						"diamond-cut-coconut", "dua-tuoi-got-kim-cuong", freshCoconut,
						"Dừa tươi gọt kim cương", "Diamond-cut fresh coconut",
						"Dừa tươi tạo hình đẹp, phù hợp kênh bán lẻ, nhà hàng và nhà phân phối đồ uống.",
						"Fresh coconuts with attractive trimming for retail, restaurant and beverage channels.",
						"https://images.unsplash.com/photo-1580984969071-a8da5656c2fb?auto=format&fit=crop&w=1200&q=80",
						List.of("Kênh đồ uống và nhà hàng", "Siêu thị trái cây nhiệt đới", "Nhà phân phối dừa tươi"),
						List.of("Beverage and restaurant channels", "Tropical fruit supermarkets", "Fresh coconut distributors"),
						"9 / 12 / 18 trái / thùng", "Nước ngọt tự nhiên, trái tươi", "Bến Tre / Mekong Delta", "Theo quy cách thị trường"
				),
				buildProduct(
						"whole-fresh-coconut", "dua-tuoi-nguyen-trai", freshCoconut,
						"Dừa tươi nguyên trái", "Whole fresh coconut",
						"Nguồn dừa tươi ổn định cho các đơn hàng volume, đóng thùng hoặc bao theo yêu cầu.",
						"Stable fresh coconut supply for volume orders, packed in cartons or bags by requirement.",
						"https://images.unsplash.com/photo-1559181567-c3190ca9959b?auto=format&fit=crop&w=1200&q=80",
						List.of("Nhà nhập khẩu volume lớn", "Chợ đầu mối và wholesale", "Nhà máy chế biến đồ uống"),
						List.of("High-volume importers", "Wholesale markets", "Beverage processing plants"),
						"20 - 25 trái / bao hoặc carton", "Trái tươi, kiểm tra ngoại quan", "Vùng trồng Bến Tre / Trà Vinh", "Theo buyer spec"
				),
				buildProduct(
						"desiccated-coconut", "com-dua-say", processedCoconut,
						"Cơm dừa sấy", "Desiccated coconut",
						"Sản phẩm chế biến từ dừa cho ngành bánh kẹo, thực phẩm và đóng gói lại.",
						"Processed coconut ingredient for bakery, confectionery and repacking customers.",
						"https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?auto=format&fit=crop&w=1200&q=80",
						List.of("Nhà máy bánh kẹo và bakery", "Nguyên liệu chế biến thực phẩm", "Khách hàng repacking"),
						List.of("Bakery and confectionery factories", "Food ingredient processing", "Repacking customers"),
						"Fine / medium grade", "Food grade / HACCP", "Nguồn dừa Việt Nam", "25 kg / bao"
				),
				buildProduct(
						"custom-produce-packing", "dong-goi-nong-san-theo-yeu-cau", oemPacking,
						"Đóng gói nông sản theo yêu cầu", "Custom produce packing",
						"Nhận phát triển quy cách thùng, nhãn và tổ hợp sản phẩm theo yêu cầu nhập khẩu.",
						"Packing, labelling and product combinations developed around importer requirements.",
						"https://images.unsplash.com/photo-1601593768798-76c20d8108fd?auto=format&fit=crop&w=1200&q=80",
						List.of("Nhãn riêng cho nhà nhập khẩu", "Combo trái cây theo mùa", "Dự án B2B theo thị trường mục tiêu"),
						List.of("Private label import programs", "Seasonal fruit combo packs", "B2B projects by target market"),
						"Carton / pouch / combo pack", "Theo tiêu chuẩn đơn hàng", "VietGAP / HACCP / buyer spec", "Tùy chỉnh theo RFQ"
				)
		));
	}

	private ProductCategoryEntity buildCategory(
			String id,
			String slug,
			String nameVi,
			String nameEn,
			String descriptionVi,
			String descriptionEn
	) {
		ProductCategoryEntity category = new ProductCategoryEntity();
		category.setId(id);
		category.setSlug(slug);
		category.setNameVi(nameVi);
		category.setNameEn(nameEn);
		category.setDescriptionVi(descriptionVi);
		category.setDescriptionEn(descriptionEn);
		category.setActive(true);
		return category;
	}

	private ProductEntity buildProduct(
			String id,
			String slug,
			ProductCategoryEntity category,
			String nameVi,
			String nameEn,
			String summaryVi,
			String summaryEn,
			String imageUrl,
			List<String> applicationsVi,
			List<String> applicationsEn,
			String thickness,
			String moisture,
			String glueType,
			String size
	) {
		ProductEntity product = new ProductEntity();
		product.setId(id);
		product.setSlug(slug);
		product.setCategory(category);
		product.setNameVi(nameVi);
		product.setNameEn(nameEn);
		product.setSummaryVi(summaryVi);
		product.setSummaryEn(summaryEn);
		product.setImageUrl(imageUrl);
		product.setApplicationsVi(applicationsVi);
		product.setApplicationsEn(applicationsEn);
		product.setThickness(thickness);
		product.setMoisture(moisture);
		product.setGlueType(glueType);
		product.setSize(size);
		product.setActive(true);
		return product;
	}
}
