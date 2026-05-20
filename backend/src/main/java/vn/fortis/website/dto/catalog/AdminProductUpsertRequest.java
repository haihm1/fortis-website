package vn.fortis.website.dto.catalog;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

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
		@NotNull(message = "Technical specifications are required")
		@Valid
		TechnicalSpecifications specifications,
		TechnicalSpecifications specificationsEn,
		TechnicalSpecifications specificationsZh,
		String quoteLabel,
		List<String> galleryImages,
		Boolean featured
) {

	public record TechnicalSpecifications(
			@NotBlank(message = "Packing format is required")
			String thickness,
			@NotBlank(message = "Quality standard is required")
			String moisture,
			@NotBlank(message = "Origin or certification is required")
			String glueType,
			@NotBlank(message = "Net weight or carton format is required")
			String size
	) {
	}
}
