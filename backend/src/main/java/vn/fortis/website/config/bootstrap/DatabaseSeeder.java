package vn.fortis.website.config.bootstrap;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import vn.fortis.website.entity.AdminAccountEntity;
import vn.fortis.website.entity.ContentProfileEntity;
import vn.fortis.website.entity.ExportMarketArticleEntity;
import vn.fortis.website.entity.HomeBannerEntity;
import vn.fortis.website.entity.NavigationMenuEntity;
import vn.fortis.website.entity.ProductCategoryEntity;
import vn.fortis.website.entity.ProductEntity;
import vn.fortis.website.repository.AdminAccountRepository;
import vn.fortis.website.repository.ContentProfileRepository;
import vn.fortis.website.repository.ExportMarketArticleRepository;
import vn.fortis.website.repository.HomeBannerRepository;
import vn.fortis.website.repository.NavigationMenuRepository;
import vn.fortis.website.repository.ProductCategoryRepository;
import vn.fortis.website.repository.ProductRepository;

@Configuration
public class DatabaseSeeder {

	/** The anchor the "about" menu item used before /about existed as a real page. */
	private static final String LEGACY_ABOUT_PATH = "/#company-profile";

	@Bean
	ApplicationRunner seedDatabase(
			AdminAccountRepository adminAccountRepository,
			ContentProfileRepository contentProfileRepository,
			HomeBannerRepository homeBannerRepository,
			NavigationMenuRepository navigationMenuRepository,
			ProductCategoryRepository productCategoryRepository,
			ProductRepository productRepository,
			ExportMarketArticleRepository exportMarketArticleRepository,
			PasswordEncoder passwordEncoder,
			@Value("${app.company.default-address}") String defaultAddress,
			@Value("${app.company.default-hotline}") String defaultHotline,
			@Value("${app.company.default-email}") String defaultEmail
	) {
		return args -> {
			seedAccounts(adminAccountRepository, passwordEncoder);
			seedContent(contentProfileRepository, homeBannerRepository, defaultAddress, defaultHotline, defaultEmail);
			seedNavigation(navigationMenuRepository);
			migrateAboutMenuPath(navigationMenuRepository);
			seedCatalog(productCategoryRepository, productRepository);
			seedExportMarket(exportMarketArticleRepository);
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
					FortisVN tập trung vào thương mại và kết nối chuỗi cung ứng cho các mặt hàng nông sản phục vụ xuất khẩu,
					trong đó ưu tiên vùng trồng ổn định, kiểm soát chất lượng và hỗ trợ tài liệu thương mại cho khách hàng B2B.
					""".strip());
			profile.setAboutArticleEn("""
					FortisVN focuses on export-oriented agricultural trading and supply-chain coordination, prioritizing stable growing regions,
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
						"FortisVN định vị như một đối tác thương mại nông sản đáng tin cậy với năng lực sourcing, kiểm soát chất lượng và tổ chức giao hàng theo yêu cầu từng thị trường.",
						"FortisVN is positioned as a trusted agricultural trading partner with sourcing discipline, quality control and shipment coordination for international buyers.",
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

	private void seedNavigation(NavigationMenuRepository navigationMenuRepository) {
		if (navigationMenuRepository.count() > 0) {
			return;
		}

		navigationMenuRepository.saveAll(List.of(
				buildMenu("home", "Trang chủ", "Home", "首页", "/", 10, true),
				buildMenu("about", "About Us", "About Us", "关于我们", "/about", 20, true),
				buildMenu("services", "Services", "Services", "服务", "/#categories", 30, true),
				buildMenu("products", "Sản phẩm", "Products", "产品", "/products", 40, true),
				buildMenu("export-market", "Export Market", "Export Market", "出口市场", "/export-market", 50, true)
		));
	}

	/**
	 * Repoints the "about" menu entry at the dedicated /about page.
	 *
	 * seedNavigation() bails out as soon as the table has any rows, so changing the
	 * seed alone would only ever affect a brand-new database — every existing
	 * environment would keep the old "/#company-profile" anchor and the menu item
	 * would still land on the home page. This runs on every boot but only rewrites
	 * the one stale value, so an admin who deliberately edits the path in the
	 * navigation screen will not have their change reverted on the next restart.
	 */
	private void migrateAboutMenuPath(NavigationMenuRepository navigationMenuRepository) {
		navigationMenuRepository.findById("about")
				.filter(menu -> LEGACY_ABOUT_PATH.equals(menu.getPath()))
				.ifPresent(menu -> {
					menu.setPath("/about");
					navigationMenuRepository.save(menu);
				});
	}

	private NavigationMenuEntity buildMenu(
			String key,
			String labelVi,
			String labelEn,
			String labelZh,
			String path,
			int sortOrder,
			boolean visible
	) {
		NavigationMenuEntity menu = new NavigationMenuEntity();
		menu.setKey(key);
		menu.setLabelVi(labelVi);
		menu.setLabelEn(labelEn);
		menu.setLabelZh(labelZh);
		menu.setPath(path);
		menu.setSortOrder(sortOrder);
		menu.setVisible(visible);
		return menu;
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
		product.setHsCode(defaultHsCode(id));
		product.setPackagingSpec(thickness);
		product.setApplicationsVi(applicationsVi);
		product.setApplicationsEn(applicationsEn);
		product.setThickness(thickness);
		product.setMoisture(moisture);
		product.setGlueType(glueType);
		product.setSize(size);
		product.setActive(true);
		product.setFeatured(true);
		return product;
	}

	private String defaultHsCode(String productId) {
		return switch (productId) {
			case "green-skin-pomelo" -> "0805.40";
			case "cavendish-banana" -> "0803.90";
			case "diamond-cut-coconut", "whole-fresh-coconut" -> "0801.12";
			case "desiccated-coconut" -> "0801.11";
			default -> "0810.90";
		};
	}

	private void seedExportMarket(ExportMarketArticleRepository articleRepository) {
		if (articleRepository.count() > 0) {
			return;
		}

		articleRepository.saveAll(List.of(
				buildArticle(
						"pepper-cinnamon-export-jan-jul",
						"statistics-of-pepper-and-cinnamon-export-volume-from-january-to-july",
						"Thống kê xuất khẩu hồ tiêu và quế từ tháng 1 đến tháng 7",
						"Statistics of pepper and cinnamon export volume from January to July",
						"Theo thống kê, 7 tháng đầu năm ghi nhận giá trị xuất khẩu hồ tiêu tăng dù sản lượng giảm, trong khi quế tiếp tục mở rộng tại các thị trường trọng điểm.",
						"Pepper export value rose despite lower volume in the first seven months, while cinnamon continued to expand across key destination markets.",
						"https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1400&q=85",
						"Pepper & Cinnamon",
						LocalDate.of(2025, 8, 12),
						true,
						List.of(
								"Theo thống kê từ ngày 1/1 đến 31/7/2025, Việt Nam xuất khẩu 145.046 tấn hồ tiêu các loại. Hồ tiêu đen đạt 124.271 tấn, hồ tiêu trắng đạt 20.775 tấn.",
								"Tổng kim ngạch xuất khẩu hồ tiêu đạt khoảng 988 triệu USD. Dù sản lượng giảm so với cùng kỳ, giá trị xuất khẩu tăng nhờ mặt bằng giá bình quân cao hơn.",
								"Đối với quế, Việt Nam xuất khẩu 73.080 tấn trong cùng giai đoạn, kim ngạch đạt khoảng 187,5 triệu USD. Ấn Độ tiếp tục là thị trường lớn nhất, tiếp theo là Hoa Kỳ, Bangladesh, UAE và Trung Quốc.",
								"FortisVN theo dõi các biến động này để hỗ trợ khách hàng B2B lên kế hoạch mua hàng, chốt quy cách đóng gói và tối ưu lịch giao theo mùa vụ."
						),
						List.of(
								"From January 1 to July 31, 2025, Vietnam exported 145,046 tons of pepper, including 124,271 tons of black pepper and 20,775 tons of white pepper.",
								"Total pepper export turnover reached around USD 988 million. Although volume declined year over year, export value improved thanks to higher average prices.",
								"For cinnamon, Vietnam shipped 73,080 tons in the same period with turnover of about USD 187.5 million. India remained the largest market, followed by the United States, Bangladesh, the UAE and China.",
								"FortisVN tracks these movements to help B2B customers plan sourcing, confirm packing specifications and optimize shipment schedules around seasonal supply."
						)
				),
				buildArticle(
						"coffee-export-throne",
						"coffee-takes-the-export-throne",
						"Cà phê giữ vị thế dẫn đầu trong nhóm nông sản xuất khẩu",
						"Coffee takes the export throne",
						"Cà phê tiếp tục đóng vai trò dẫn dắt khi nhiều nhóm nông, lâm, thủy sản tăng trưởng mạnh trong các tháng đầu năm.",
						"Coffee continued to lead as several agricultural, forestry and fishery product groups posted strong export growth.",
						"https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1400&q=85",
						"Coffee",
						LocalDate.of(2025, 8, 11),
						true,
						List.of(
								"Nhu cầu ổn định từ các thị trường rang xay và chế biến giúp cà phê duy trì giá trị xuất khẩu cao.",
								"Các doanh nghiệp xuất khẩu cần kiểm soát độ ẩm, tạp chất, quy cách bao bì và lịch giao để phù hợp yêu cầu từng thị trường.",
								"Với khách hàng nhập khẩu, việc theo dõi biến động giá và tồn kho giúp giảm rủi ro khi chốt hợp đồng dài hạn."
						),
						List.of(
								"Stable demand from roasting and processing markets helped coffee maintain strong export value.",
								"Exporters need to control moisture, impurities, packing formats and shipment timing to match each market's requirements.",
								"For importers, tracking price movement and inventory levels can reduce risk when negotiating longer-term contracts."
						)
				),
				buildArticle(
						"long-term-agricultural-export-strategy",
						"long-term-strategy-is-needed-to-maintain-agricultural-export-position",
						"Cần chiến lược dài hạn để giữ vị thế xuất khẩu nông sản",
						"Long-term strategy is needed to maintain agricultural export position",
						"Nông nghiệp Việt Nam cần tiếp tục đầu tư vào chất lượng, truy xuất nguồn gốc và năng lực chế biến để giữ đà tăng trưởng.",
						"Vietnamese agriculture needs continued investment in quality, traceability and processing capacity to sustain growth.",
						"https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1400&q=85",
						"Strategy",
						LocalDate.of(2025, 8, 10),
						false,
						List.of(
								"Trong bối cảnh rào cản kỹ thuật ngày càng rõ, lợi thế giá không còn là yếu tố duy nhất để cạnh tranh.",
								"Doanh nghiệp cần xây dựng vùng nguyên liệu ổn định, tiêu chuẩn kiểm soát chất lượng và dữ liệu truy xuất minh bạch.",
								"FortisVN định hướng phát triển mạng lưới đối tác có khả năng đáp ứng đều về chất lượng, chứng từ và tiến độ giao hàng."
						),
						List.of(
								"As technical barriers become more visible, price advantage alone is no longer enough to compete.",
								"Companies need stable sourcing regions, quality-control standards and transparent traceability data.",
								"FortisVN aims to develop a partner network capable of consistent quality, documentation and delivery performance."
						)
				),
				buildArticle(
						"lychee-export-orders",
						"viet-linh-continuously-updates-lychee-export-orders",
						"Cập nhật đơn hàng vải xuất khẩu sang thị trường quốc tế",
						"Lychee export orders update for international markets",
						"Mùa vải mở ra cơ hội ngắn hạn cho các đơn hàng trái cây tươi nếu kiểm soát tốt thu hoạch, làm mát và logistics.",
						"The lychee season creates short-term opportunities for fresh fruit orders when harvest, cooling and logistics are tightly controlled.",
						"https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=1400&q=85",
						"Fresh Fruit",
						LocalDate.of(2025, 6, 18),
						false,
						List.of(
								"Vải là mặt hàng có mùa vụ ngắn nên kế hoạch thu mua, sơ chế và đặt lịch vận chuyển cần được chuẩn bị sớm.",
								"Các thị trường như Trung Quốc, Nhật Bản, Hàn Quốc và Australia thường yêu cầu tiêu chuẩn kiểm dịch và đóng gói rõ ràng.",
								"Việc phối hợp từ vùng trồng đến kho đóng gói giúp giảm rủi ro trễ lịch và giữ chất lượng trái khi đến cảng đích."
						),
						List.of(
								"Lychee has a short season, so purchasing, packing and shipment planning should be prepared early.",
								"Markets such as China, Japan, Korea and Australia usually require clear quarantine and packing standards.",
								"Coordinating from growing area to packing house helps reduce schedule risk and maintain fruit quality at destination."
						)
				)
		));
	}

	private ExportMarketArticleEntity buildArticle(
			String id,
			String slug,
			String titleVi,
			String titleEn,
			String excerptVi,
			String excerptEn,
			String imageUrl,
			String category,
			LocalDate publishedAt,
			boolean featured,
			List<String> paragraphsVi,
			List<String> paragraphsEn
	) {
		ExportMarketArticleEntity article = new ExportMarketArticleEntity();
		article.setId(id);
		article.setSlug(slug);
		article.setTitleVi(titleVi);
		article.setTitleEn(titleEn);
		article.setExcerptVi(excerptVi);
		article.setExcerptEn(excerptEn);
		article.setImageUrl(imageUrl);
		article.setCategory(category);
		article.setAuthor("FortisVN");
		article.setPublishedAt(publishedAt);
		article.setFeatured(featured);
		article.setActive(true);
		article.setParagraphsVi(paragraphsVi);
		article.setParagraphsEn(paragraphsEn);
		return article;
	}
}
