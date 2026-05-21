package vn.fortis.website.dto.catalog;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

public record AdminProductUpsertRequest(
		@NotBlank(message = "Product slug is required")
		String slug,
		@NotBlank(message = "Category id is required")
		String categoryId,
		@NotBlank(message = "Product name is required")
		String name,
		String nameEn,
		String nameZh,
		@NotBlank(message = "Product summary is required")
		String summary,
		String summaryEn,
		String summaryZh,
		@NotEmpty(message = "At least one application is required")
		List<String> applications,
		List<String> applicationsEn,
		List<String> applicationsZh,
		@NotEmpty(message = "At least one technical specification is required")
		List<@Valid TechnicalSpecificationItem> specifications,
		String quoteLabel,
		List<String> galleryImages,
		List<String> deletedGalleryImages,
		Boolean featured
) {

	public record TechnicalSpecificationItem(
			@NotBlank(message = "Vietnamese specification label is required")
			String label,
			String labelEn,
			String labelZh,
			@NotBlank(message = "Vietnamese specification value is required")
			String value,
			String valueEn,
			String valueZh
	) {
	}
}
