package vn.fortis.website.dto.exportmarket;

import java.time.LocalDate;
import java.util.List;

public record ExportMarketListResponse(
		String locale,
		PageHeader pageHeader,
		List<ArticleSummary> articles,
		Labels labels
) {
	public record PageHeader(String eyebrow, String title, String description) {
	}

	public record ArticleSummary(
			String id,
			String slug,
			String title,
			String excerpt,
			String image,
			String category,
			String author,
			LocalDate publishedAt,
			boolean featured
	) {
	}

	public record Labels(
			String breadcrumbHome,
			String breadcrumbCurrent,
			String readMore,
			String latestPosts,
			String maybeYouLike,
			String noArticles
	) {
	}
}
