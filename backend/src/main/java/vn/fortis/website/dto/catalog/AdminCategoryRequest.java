package vn.fortis.website.dto.catalog;

import jakarta.validation.constraints.NotBlank;

public record AdminCategoryRequest(
		@NotBlank(message = "Category slug is required")
		String slug,
		@NotBlank(message = "Category name is required")
		String name,
		String nameEn,
		String nameZh,
		@NotBlank(message = "Category description is required")
		String description,
		String descriptionEn,
		String descriptionZh,
		Boolean active
) {
}
