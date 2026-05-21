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
			String nameEn,
			String nameZh,
			String description,
			String descriptionEn,
			String descriptionZh,
			boolean active
	) {
	}

	public record ProductAdminItem(
			String id,
			String slug,
			String categoryId,
			String name,
			String nameEn,
			String nameZh,
			String summary,
			String summaryEn,
			String summaryZh,
			String imageUrl,
			String specificationFileUrl,
			List<String> galleryImages,
			List<String> applications,
			List<String> applicationsEn,
			List<String> applicationsZh,
			List<TechnicalSpecificationItem> specifications,
			String quoteLabel,
			boolean featured
	) {
	}

	public record TechnicalSpecificationItem(
			String label,
			String labelEn,
			String labelZh,
			String value,
			String valueEn,
			String valueZh
	) {
	}
}
