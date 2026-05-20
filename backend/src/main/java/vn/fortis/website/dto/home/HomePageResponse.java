package vn.fortis.website.dto.home;

import java.util.List;

public record HomePageResponse(
		String locale,
		CompanyInfo company,
		String introductionArticle,
		List<HeroSlide> heroSlides,
		SectionHeader coreValuesSection,
		List<CoreValue> coreValues,
		SectionHeader featuredProductsSection,
		List<ProductHighlight> featuredProducts,
		SectionHeader credentialsSection,
		List<CredentialBadge> certificates,
		List<PartnerBadge> partners
) {

	public record CompanyInfo(
			String vietnameseName,
			String englishName,
			String shortName,
			String tagline,
			String primaryActionLabel,
			String secondaryActionLabel,
			String address,
			String hotline,
			String email
	) {
	}

	public record HeroSlide(
			String eyebrow,
			String title,
			String description,
			String image,
			String overlayLabel,
			List<FactItem> facts
	) {
	}

	public record FactItem(String label, String value) {
	}

	public record SectionHeader(String eyebrow, String title, String description) {
	}

	public record CoreValue(String title, String description, String highlight) {
	}

	public record ProductHighlight(
			String slug,
			String name,
			String category,
			String summary,
			String image,
			String grade,
			String commonUse
	) {
	}

	public record CredentialBadge(String name, String description) {
	}

	public record PartnerBadge(String name, String region) {
	}
}
