package vn.fortis.website.service.exportmarket;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import vn.fortis.website.dto.exportmarket.AdminExportMarketResponse;
import vn.fortis.website.dto.exportmarket.AdminExportMarketUpsertRequest;
import vn.fortis.website.dto.exportmarket.ExportMarketDetailResponse;
import vn.fortis.website.dto.exportmarket.ExportMarketListResponse;
import vn.fortis.website.entity.ExportMarketArticleEntity;
import vn.fortis.website.repository.ExportMarketArticleRepository;

@Service
@Transactional(readOnly = true)
public class ExportMarketService {

	private final ExportMarketArticleRepository articleRepository;

	public ExportMarketService(ExportMarketArticleRepository articleRepository) {
		this.articleRepository = articleRepository;
	}

	public ExportMarketListResponse getArticles(String lang) {
		String locale = normalizeLocale(lang);
		return new ExportMarketListResponse(
				locale,
				buildHeader(locale),
				articleRepository.findByActiveTrueOrderByPublishedAtDesc().stream()
						.map(article -> mapSummary(article, locale))
						.toList(),
				buildLabels(locale)
		);
	}

	public ExportMarketDetailResponse getArticle(String slug, String lang) {
		String locale = normalizeLocale(lang);
		ExportMarketArticleEntity article = articleRepository.findBySlugAndActiveTrue(slug)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Export market article not found"));
		List<ExportMarketArticleEntity> articles = articleRepository.findByActiveTrueOrderByPublishedAtDesc();

		return new ExportMarketDetailResponse(
				locale,
				mapDetail(article, locale),
				articles.stream()
						.filter(item -> !item.getId().equals(article.getId()))
						.limit(5)
						.map(item -> mapSummary(item, locale))
						.toList(),
				articles.stream()
						.filter(item -> !item.getId().equals(article.getId()))
						.filter(item -> item.getCategory().equals(article.getCategory()) || item.isFeatured())
						.limit(5)
						.map(item -> mapSummary(item, locale))
						.toList(),
				buildLabels(locale)
		);
	}

	public AdminExportMarketResponse getAdminArticles() {
		return new AdminExportMarketResponse(
				articleRepository.findAllByOrderByPublishedAtDesc().stream()
						.map(this::mapAdmin)
						.toList()
		);
	}

	@Transactional
	public AdminExportMarketResponse.ArticleAdminItem createArticle(AdminExportMarketUpsertRequest request) {
		validateUniqueSlug(request.slug(), null);
		ExportMarketArticleEntity article = new ExportMarketArticleEntity();
		article.setId(UUID.randomUUID().toString());
		applyArticleValues(article, request);
		return mapAdmin(articleRepository.save(article));
	}

	@Transactional
	public AdminExportMarketResponse.ArticleAdminItem updateArticle(
			String articleId,
			AdminExportMarketUpsertRequest request
	) {
		ExportMarketArticleEntity article = requireArticle(articleId);
		validateUniqueSlug(request.slug(), articleId);
		applyArticleValues(article, request);
		return mapAdmin(articleRepository.save(article));
	}

	@Transactional
	public void deleteArticle(String articleId) {
		requireArticle(articleId);
		articleRepository.deleteById(articleId);
	}

	private String normalizeLocale(String lang) {
		if ("zh".equalsIgnoreCase(lang) || "cn".equalsIgnoreCase(lang) || "zh-cn".equalsIgnoreCase(lang)) {
			return "zh";
		}
		return "en".equalsIgnoreCase(lang) ? "en" : "vi";
	}

	private ExportMarketListResponse.PageHeader buildHeader(String locale) {
		if ("zh".equals(locale)) {
			return new ExportMarketListResponse.PageHeader(
					"出口市场",
					"为农产品采购团队提供出口市场资讯。",
					"通过简洁资讯跟踪胡椒、肉桂、咖啡和新鲜农产品出口趋势，支持 B2B 采购计划。"
			);
		}
		if ("en".equals(locale)) {
			return new ExportMarketListResponse.PageHeader(
					"Export market",
					"Export market intelligence for agricultural sourcing teams.",
					"Follow pepper, cinnamon, coffee and fresh produce export trends with concise updates for B2B planning."
			);
		}

		return new ExportMarketListResponse.PageHeader(
				"Thị trường xuất khẩu",
				"Cập nhật thị trường xuất khẩu cho khách hàng sourcing nông sản.",
				"Theo dõi xu hướng hồ tiêu, quế, cà phê và nông sản tươi qua các bản tin ngắn phục vụ kế hoạch B2B."
		);
	}

	private ExportMarketListResponse.Labels buildLabels(String locale) {
		if ("zh".equals(locale)) {
			return new ExportMarketListResponse.Labels(
					"首页",
					"出口市场",
					"阅读更多",
					"最新文章",
					"您可能感兴趣",
					"暂无出口市场文章。"
			);
		}
		if ("en".equals(locale)) {
			return new ExportMarketListResponse.Labels(
					"Home",
					"Export market",
					"Read more",
					"New post",
					"Maybe you like",
					"No export market articles are available."
			);
		}

		return new ExportMarketListResponse.Labels(
				"Trang chủ",
				"Thị trường xuất khẩu",
				"Đọc tiếp",
				"Bài mới",
				"Có thể bạn quan tâm",
				"Chưa có bài viết thị trường xuất khẩu."
		);
	}

	private ExportMarketListResponse.ArticleSummary mapSummary(ExportMarketArticleEntity article, String locale) {
		boolean english = "en".equals(locale);
		boolean chinese = "zh".equals(locale);
		return new ExportMarketListResponse.ArticleSummary(
				article.getId(),
				article.getSlug(),
				chinese ? textWithFallback(article.getTitleZh(), article.getTitleEn(), article.getTitleVi()) : english ? article.getTitleEn() : article.getTitleVi(),
				chinese ? textWithFallback(article.getExcerptZh(), article.getExcerptEn(), article.getExcerptVi()) : english ? article.getExcerptEn() : article.getExcerptVi(),
				article.getImageUrl(),
				article.getCategory(),
				article.getAuthor(),
				article.getPublishedAt(),
				article.isFeatured()
		);
	}

	private ExportMarketDetailResponse.ArticleDetail mapDetail(ExportMarketArticleEntity article, String locale) {
		boolean english = "en".equals(locale);
		boolean chinese = "zh".equals(locale);
		return new ExportMarketDetailResponse.ArticleDetail(
				article.getId(),
				article.getSlug(),
				chinese ? textWithFallback(article.getTitleZh(), article.getTitleEn(), article.getTitleVi()) : english ? article.getTitleEn() : article.getTitleVi(),
				chinese ? textWithFallback(article.getExcerptZh(), article.getExcerptEn(), article.getExcerptVi()) : english ? article.getExcerptEn() : article.getExcerptVi(),
				article.getImageUrl(),
				article.getCategory(),
				article.getAuthor(),
				article.getPublishedAt(),
				chinese ? listWithFallback(article.getParagraphsZh(), article.getParagraphsEn(), article.getParagraphsVi()) : english ? List.copyOf(article.getParagraphsEn()) : List.copyOf(article.getParagraphsVi())
		);
	}

	private AdminExportMarketResponse.ArticleAdminItem mapAdmin(ExportMarketArticleEntity article) {
		return new AdminExportMarketResponse.ArticleAdminItem(
				article.getId(),
				article.getSlug(),
				article.getTitleVi(),
				article.getTitleEn(),
				article.getTitleZh(),
				article.getExcerptVi(),
				article.getExcerptEn(),
				article.getExcerptZh(),
				article.getImageUrl(),
				article.getCategory(),
				article.getAuthor(),
				article.getPublishedAt(),
				article.isFeatured(),
				article.isActive(),
				List.copyOf(article.getParagraphsVi()),
				List.copyOf(article.getParagraphsEn()),
				List.copyOf(article.getParagraphsZh())
		);
	}

	private void applyArticleValues(
			ExportMarketArticleEntity article,
			AdminExportMarketUpsertRequest request
	) {
		article.setSlug(request.slug());
		article.setTitleVi(request.titleVi());
		article.setTitleEn(request.titleEn());
		article.setTitleZh(nullableTrim(request.titleZh()));
		article.setExcerptVi(request.excerptVi());
		article.setExcerptEn(request.excerptEn());
		article.setExcerptZh(nullableTrim(request.excerptZh()));
		article.setImageUrl(request.imageUrl());
		article.setCategory(request.category());
		article.setAuthor(request.author());
		article.setPublishedAt(request.publishedAt());
		article.setFeatured(request.featured());
		article.setActive(request.active());
		article.setParagraphsVi(new ArrayList<>(request.paragraphsVi()));
		article.setParagraphsEn(new ArrayList<>(request.paragraphsEn()));
		article.setParagraphsZh(new ArrayList<>(request.paragraphsZh() == null ? List.of() : request.paragraphsZh()));
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

	private List<String> listWithFallback(List<String> primary, List<String> secondary, List<String> tertiary) {
		if (primary != null && !primary.isEmpty()) {
			return List.copyOf(primary);
		}
		if (secondary != null && !secondary.isEmpty()) {
			return List.copyOf(secondary);
		}
		return tertiary == null ? List.of() : List.copyOf(tertiary);
	}

	private String nullableTrim(String value) {
		if (value == null || value.isBlank()) {
			return null;
		}
		return value.trim();
	}

	private ExportMarketArticleEntity requireArticle(String articleId) {
		return articleRepository.findById(articleId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Export market article not found"));
	}

	private void validateUniqueSlug(String slug, String currentArticleId) {
		articleRepository.findBySlug(slug).ifPresent(existing -> {
			if (!existing.getId().equals(currentArticleId)) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Article slug already exists");
			}
		});
	}
}
