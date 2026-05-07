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
		@NotBlank(message = "Product summary is required")
		String summary,
		@NotEmpty(message = "At least one application is required")
		List<String> applications,
		@NotNull(message = "Technical specifications are required")
		@Valid
		TechnicalSpecifications specifications,
		String quoteLabel
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
