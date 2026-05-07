package vn.fortis.website.dto.content;

import java.util.List;

public record AdminContentResponse(
		String aboutArticleVi,
		String aboutArticleEn,
		String address,
		String hotline,
		String email,
		List<BannerItem> banners
) {

	public record BannerItem(
			int slot,
			String titleVi,
			String titleEn,
			String descriptionVi,
			String descriptionEn,
			String overlayLabel,
			String imageUrl
	) {
	}
}
