package vn.fortis.website.entity;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;

@Entity
@Table(name = "export_market_articles")
public class ExportMarketArticleEntity extends BaseAuditEntity {

	@Id
	private String id;

	@Column(nullable = false, unique = true, length = 160)
	private String slug;

	@Column(name = "title_vi", nullable = false, length = 260)
	private String titleVi;

	@Column(name = "title_en", nullable = false, length = 260)
	private String titleEn;

	@Column(name = "title_zh", length = 260)
	private String titleZh;

	@Column(name = "excerpt_vi", nullable = false, columnDefinition = "TEXT")
	private String excerptVi;

	@Column(name = "excerpt_en", nullable = false, columnDefinition = "TEXT")
	private String excerptEn;

	@Column(name = "excerpt_zh", columnDefinition = "TEXT")
	private String excerptZh;

	@Column(name = "image_url", nullable = false, length = 500)
	private String imageUrl;

	@Column(nullable = false, length = 120)
	private String category;

	@Column(nullable = false, length = 120)
	private String author;

	@Column(name = "published_at", nullable = false)
	private LocalDate publishedAt;

	@Column(nullable = false)
	private boolean featured;

	@Column(nullable = false)
	private boolean active = true;

	@ElementCollection(fetch = FetchType.EAGER)
	@CollectionTable(name = "export_market_article_paragraphs_vi", joinColumns = @JoinColumn(name = "article_id"))
	@Column(name = "paragraph_value", nullable = false, columnDefinition = "TEXT")
	private List<String> paragraphsVi = new ArrayList<>();

	@ElementCollection(fetch = FetchType.EAGER)
	@CollectionTable(name = "export_market_article_paragraphs_en", joinColumns = @JoinColumn(name = "article_id"))
	@Column(name = "paragraph_value", nullable = false, columnDefinition = "TEXT")
	private List<String> paragraphsEn = new ArrayList<>();

	@ElementCollection(fetch = FetchType.EAGER)
	@CollectionTable(name = "export_market_article_paragraphs_zh", joinColumns = @JoinColumn(name = "article_id"))
	@Column(name = "paragraph_value", nullable = false, columnDefinition = "TEXT")
	private List<String> paragraphsZh = new ArrayList<>();

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getSlug() {
		return slug;
	}

	public void setSlug(String slug) {
		this.slug = slug;
	}

	public String getTitleVi() {
		return titleVi;
	}

	public void setTitleVi(String titleVi) {
		this.titleVi = titleVi;
	}

	public String getTitleEn() {
		return titleEn;
	}

	public void setTitleEn(String titleEn) {
		this.titleEn = titleEn;
	}

	public String getTitleZh() {
		return titleZh;
	}

	public void setTitleZh(String titleZh) {
		this.titleZh = titleZh;
	}

	public String getExcerptVi() {
		return excerptVi;
	}

	public void setExcerptVi(String excerptVi) {
		this.excerptVi = excerptVi;
	}

	public String getExcerptEn() {
		return excerptEn;
	}

	public void setExcerptEn(String excerptEn) {
		this.excerptEn = excerptEn;
	}

	public String getExcerptZh() {
		return excerptZh;
	}

	public void setExcerptZh(String excerptZh) {
		this.excerptZh = excerptZh;
	}

	public String getImageUrl() {
		return imageUrl;
	}

	public void setImageUrl(String imageUrl) {
		this.imageUrl = imageUrl;
	}

	public String getCategory() {
		return category;
	}

	public void setCategory(String category) {
		this.category = category;
	}

	public String getAuthor() {
		return author;
	}

	public void setAuthor(String author) {
		this.author = author;
	}

	public LocalDate getPublishedAt() {
		return publishedAt;
	}

	public void setPublishedAt(LocalDate publishedAt) {
		this.publishedAt = publishedAt;
	}

	public boolean isFeatured() {
		return featured;
	}

	public void setFeatured(boolean featured) {
		this.featured = featured;
	}

	public boolean isActive() {
		return active;
	}

	public void setActive(boolean active) {
		this.active = active;
	}

	public List<String> getParagraphsVi() {
		return paragraphsVi;
	}

	public void setParagraphsVi(List<String> paragraphsVi) {
		this.paragraphsVi = new ArrayList<>(paragraphsVi);
	}

	public List<String> getParagraphsEn() {
		return paragraphsEn;
	}

	public void setParagraphsEn(List<String> paragraphsEn) {
		this.paragraphsEn = new ArrayList<>(paragraphsEn);
	}

	public List<String> getParagraphsZh() {
		return paragraphsZh;
	}

	public void setParagraphsZh(List<String> paragraphsZh) {
		this.paragraphsZh = new ArrayList<>(paragraphsZh);
	}
}
