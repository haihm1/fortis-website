package vn.fortis.website.controller.publicapi;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import vn.fortis.website.entity.ExportMarketArticleEntity;
import vn.fortis.website.entity.ProductEntity;
import vn.fortis.website.repository.ExportMarketArticleRepository;
import vn.fortis.website.repository.ProductRepository;

@RestController
public class SitemapController {

	private final ProductRepository productRepository;
	private final ExportMarketArticleRepository articleRepository;
	private final String siteUrl;

	public SitemapController(
			ProductRepository productRepository,
			ExportMarketArticleRepository articleRepository,
			@Value("${app.site-url:https://fortisvn.com}") String siteUrl
	) {
		this.productRepository = productRepository;
		this.articleRepository = articleRepository;
		this.siteUrl = normalizeSiteUrl(siteUrl);
	}

	@GetMapping(path = "/api/public/sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE)
	public String getSitemap() {
		List<SitemapEntry> entries = new ArrayList<>();
		LocalDate today = LocalDate.now();

		entries.add(new SitemapEntry("/", today, "daily", "1.0"));
		entries.add(new SitemapEntry("/products", today, "daily", "0.9"));
		entries.add(new SitemapEntry("/export-market", today, "weekly", "0.8"));
		entries.add(new SitemapEntry("/contact", today, "monthly", "0.6"));

		for (ProductEntity product : productRepository.findByActiveTrueOrderByCreatedAtAsc()) {
			entries.add(new SitemapEntry(
					"/products/" + product.getSlug(),
					lastModified(product.getUpdatedAt(), today),
					"weekly",
					"0.85"
			));
		}

		for (ExportMarketArticleEntity article : articleRepository.findByActiveTrueOrderByPublishedAtDesc()) {
			entries.add(new SitemapEntry(
					"/export-market/" + article.getSlug(),
					article.getPublishedAt() != null ? article.getPublishedAt() : lastModified(article.getUpdatedAt(), today),
					"monthly",
					"0.7"
			));
		}

		StringBuilder xml = new StringBuilder();
		xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
		xml.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n");
		for (SitemapEntry entry : entries) {
			xml.append("  <url>\n");
			xml.append("    <loc>").append(escapeXml(siteUrl + entry.path())).append("</loc>\n");
			xml.append("    <lastmod>").append(entry.lastmod().format(DateTimeFormatter.ISO_DATE)).append("</lastmod>\n");
			xml.append("    <changefreq>").append(entry.changefreq()).append("</changefreq>\n");
			xml.append("    <priority>").append(entry.priority()).append("</priority>\n");
			xml.append("  </url>\n");
		}
		xml.append("</urlset>\n");
		return xml.toString();
	}

	private static String normalizeSiteUrl(String value) {
		String normalized = value == null || value.isBlank() ? "https://fortisvn.com" : value.trim();
		while (normalized.endsWith("/")) {
			normalized = normalized.substring(0, normalized.length() - 1);
		}
		return normalized;
	}

	private static LocalDate lastModified(LocalDateTime value, LocalDate fallback) {
		return value != null ? value.toLocalDate() : fallback;
	}

	private static String escapeXml(String value) {
		return value
				.replace("&", "&amp;")
				.replace("<", "&lt;")
				.replace(">", "&gt;")
				.replace("\"", "&quot;")
				.replace("'", "&apos;");
	}

	private record SitemapEntry(String path, LocalDate lastmod, String changefreq, String priority) {
	}
}

