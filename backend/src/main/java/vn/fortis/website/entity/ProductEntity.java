package vn.fortis.website.entity;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "products")
public class ProductEntity extends BaseAuditEntity {

	@Id
	private String id;

	@Column(nullable = false, unique = true, length = 120)
	private String slug;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "category_id", nullable = false)
	private ProductCategoryEntity category;

	@Column(name = "name_vi", nullable = false, length = 150)
	private String nameVi;

	@Column(name = "name_en", nullable = false, length = 150)
	private String nameEn;

	@Column(name = "summary_vi", nullable = false, columnDefinition = "TEXT")
	private String summaryVi;

	@Column(name = "summary_en", nullable = false, columnDefinition = "TEXT")
	private String summaryEn;

	@Column(name = "image_url", nullable = false, length = 500)
	private String imageUrl;

	@Column(name = "specification_file_url", length = 500)
	private String specificationFileUrl;

	@Column(nullable = false, length = 100)
	private String thickness;

	@Column(nullable = false, length = 100)
	private String moisture;

	@Column(name = "glue_type", nullable = false, length = 120)
	private String glueType;

	@Column(nullable = false, length = 150)
	private String size;

	@Column(nullable = false)
	private boolean active = true;

	@ElementCollection(fetch = FetchType.EAGER)
	@CollectionTable(name = "product_applications_vi", joinColumns = @JoinColumn(name = "product_id"))
	@Column(name = "application_value", nullable = false, length = 255)
	private List<String> applicationsVi = new ArrayList<>();

	@ElementCollection(fetch = FetchType.EAGER)
	@CollectionTable(name = "product_applications_en", joinColumns = @JoinColumn(name = "product_id"))
	@Column(name = "application_value", nullable = false, length = 255)
	private List<String> applicationsEn = new ArrayList<>();

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

	public ProductCategoryEntity getCategory() {
		return category;
	}

	public void setCategory(ProductCategoryEntity category) {
		this.category = category;
	}

	public String getNameVi() {
		return nameVi;
	}

	public void setNameVi(String nameVi) {
		this.nameVi = nameVi;
	}

	public String getNameEn() {
		return nameEn;
	}

	public void setNameEn(String nameEn) {
		this.nameEn = nameEn;
	}

	public String getSummaryVi() {
		return summaryVi;
	}

	public void setSummaryVi(String summaryVi) {
		this.summaryVi = summaryVi;
	}

	public String getSummaryEn() {
		return summaryEn;
	}

	public void setSummaryEn(String summaryEn) {
		this.summaryEn = summaryEn;
	}

	public String getImageUrl() {
		return imageUrl;
	}

	public void setImageUrl(String imageUrl) {
		this.imageUrl = imageUrl;
	}

	public String getSpecificationFileUrl() {
		return specificationFileUrl;
	}

	public void setSpecificationFileUrl(String specificationFileUrl) {
		this.specificationFileUrl = specificationFileUrl;
	}

	public String getThickness() {
		return thickness;
	}

	public void setThickness(String thickness) {
		this.thickness = thickness;
	}

	public String getMoisture() {
		return moisture;
	}

	public void setMoisture(String moisture) {
		this.moisture = moisture;
	}

	public String getGlueType() {
		return glueType;
	}

	public void setGlueType(String glueType) {
		this.glueType = glueType;
	}

	public String getSize() {
		return size;
	}

	public void setSize(String size) {
		this.size = size;
	}

	public boolean isActive() {
		return active;
	}

	public void setActive(boolean active) {
		this.active = active;
	}

	public List<String> getApplicationsVi() {
		return applicationsVi;
	}

	public void setApplicationsVi(List<String> applicationsVi) {
		this.applicationsVi = applicationsVi;
	}

	public List<String> getApplicationsEn() {
		return applicationsEn;
	}

	public void setApplicationsEn(List<String> applicationsEn) {
		this.applicationsEn = applicationsEn;
	}
}
