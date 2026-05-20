package vn.fortis.website.dto.exportmarket;

import java.time.LocalDate;
import java.util.List;

public record ExportMarketDetailResponse(
		String locale,
		ArticleDetail article,
		List<ExportMarketListResponse.ArticleSummary> latestPosts,
		List<ExportMarketListResponse.ArticleSummary> relatedPosts,
		ExportMarketListResponse.Labels labels
) {
	public record ArticleDetail(
			String id,
			String slug,
			String title,
			String excerpt,
			String image,
			String category,
			String author,
			LocalDate publishedAt,
			List<String> paragraphs
	) {
	}
}
