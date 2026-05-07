package vn.fortis.website.dto.catalog;

import java.util.List;

public record AdminCatalogResponse(
		List<CategoryAdminItem> categories,
		List<ProductAdminItem> products
) {

	public record CategoryAdminItem(
			String id,
			String slug,
			String name,
			String description
	) {
	}

	public record ProductAdminItem(
			String id,
			String slug,
			String categoryId,
			String name,
			String summary,
			String imageUrl,
			String specificationFileUrl,
			List<String> applications,
			TechnicalSpecifications specifications,
			String quoteLabel
	) {
	}

	public record TechnicalSpecifications(
			String thickness,
			String moisture,
			String glueType,
			String size
	) {
	}
}
