package vn.fortis.website.dto.content;

import jakarta.validation.constraints.NotBlank;

public record AdminBannerUpdateRequest(
		@NotBlank(message = "Vietnamese title is required")
		String titleVi,
		@NotBlank(message = "English title is required")
		String titleEn,
		String titleZh,
		@NotBlank(message = "Vietnamese description is required")
		String descriptionVi,
		@NotBlank(message = "English description is required")
		String descriptionEn,
		String descriptionZh,
		@NotBlank(message = "Overlay label is required")
		String overlayLabel
) {
}
