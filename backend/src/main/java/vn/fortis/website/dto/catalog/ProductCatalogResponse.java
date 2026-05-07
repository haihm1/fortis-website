package vn.fortis.website.dto.catalog;

import java.util.List;

public record ProductCatalogResponse(
		String locale,
		PageHeader pageHeader,
		List<CategoryItem> categories,
		List<ProductItem> products,
		QuoteSection quoteSection,
		CatalogLabels labels
) {

	public record PageHeader(String eyebrow, String title, String description) {
	}

	public record CategoryItem(
			String id,
			String slug,
			String name,
			String description
	) {
	}

	public record ProductItem(
			String id,
			String slug,
			String categoryId,
			String categoryName,
			String name,
			String summary,
			String image,
			String specificationFileUrl,
			List<String> gallery,
			TechnicalSpecifications specifications,
			List<String> applications,
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

	public record QuoteSection(
			String eyebrow,
			String title,
			String description,
			QuoteFields fields
	) {
	}

	public record QuoteFields(
			String name,
			String company,
			String email,
			String phone,
			String quantity,
			String targetMarket,
			String specificationDetails,
			String attachment,
			String message,
			String submit
	) {
	}

	public record CatalogLabels(
			String allProducts,
			String productList,
			String productDetail,
			String applications,
			String technicalSpecs,
			String empty
	) {
	}
}
