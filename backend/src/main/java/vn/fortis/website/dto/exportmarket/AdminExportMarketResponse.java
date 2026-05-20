package vn.fortis.website.dto.exportmarket;

import java.time.LocalDate;
import java.util.List;

public record AdminExportMarketResponse(
		List<ArticleAdminItem> articles
) {
	public record ArticleAdminItem(
			String id,
			String slug,
			String titleVi,
			String titleEn,
			String titleZh,
			String excerptVi,
			String excerptEn,
			String excerptZh,
			String imageUrl,
			String category,
			String author,
			LocalDate publishedAt,
			boolean featured,
			boolean active,
			List<String> paragraphsVi,
			List<String> paragraphsEn,
			List<String> paragraphsZh
	) {
	}
}
