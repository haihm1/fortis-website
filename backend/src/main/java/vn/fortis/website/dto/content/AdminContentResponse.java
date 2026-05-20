package vn.fortis.website.dto.content;

import java.util.List;

public record AdminContentResponse(
		String aboutArticleVi,
		String aboutArticleEn,
		String aboutArticleZh,
		String address,
		String hotline,
		String email,
		List<BannerItem> banners
) {

	public record BannerItem(
			int slot,
			String titleVi,
			String titleEn,
			String titleZh,
			String descriptionVi,
			String descriptionEn,
			String descriptionZh,
			String overlayLabel,
			String imageUrl
	) {
	}
}
