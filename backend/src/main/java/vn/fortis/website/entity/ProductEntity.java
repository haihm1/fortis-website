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

	@Column(name = "name_zh", length = 150)
	private String nameZh;

	@Column(name = "summary_vi", nullable = false, columnDefinition = "TEXT")
	private String summaryVi;

	@Column(name = "summary_en", nullable = false, columnDefinition = "TEXT")
	private String summaryEn;

	@Column(name = "summary_zh", columnDefinition = "TEXT")
	private String summaryZh;

	@Column(name = "detail_description_vi", columnDefinition = "TEXT")
	private String detailDescriptionVi;

	@Column(name = "detail_description_en", columnDefinition = "TEXT")
	private String detailDescriptionEn;

	@Column(name = "detail_description_zh", columnDefinition = "TEXT")
	private String detailDescriptionZh;

	@Column(name = "image_url", nullable = false, length = 500)
	private String imageUrl;

	@Column(name = "specification_file_url", length = 500)
	private String specificationFileUrl;

	@Column(name = "hs_code", length = 80)
	private String hsCode;

	@Column(name = "packaging_spec", length = 500)
	private String packagingSpec;

	@ElementCollection(fetch = FetchType.EAGER)
	@CollectionTable(name = "product_gallery_images", joinColumns = @JoinColumn(name = "product_id"))
	@Column(name = "image_url", nullable = false, length = 500)
	private List<String> galleryImageUrls = new ArrayList<>();

	@ElementCollection(fetch = FetchType.EAGER)
	@CollectionTable(name = "product_specifications", joinColumns = @JoinColumn(name = "product_id"))
	private List<ProductSpecificationValue> specifications = new ArrayList<>();

	@ElementCollection(fetch = FetchType.EAGER)
	@CollectionTable(name = "product_highlights", joinColumns = @JoinColumn(name = "product_id"))
	private List<ProductSpecificationValue> highlights = new ArrayList<>();

	@ElementCollection(fetch = FetchType.EAGER)
	@CollectionTable(name = "product_quality_control_steps", joinColumns = @JoinColumn(name = "product_id"))
	private List<ProductSpecificationValue> qualityControlSteps = new ArrayList<>();

	@Column(nullable = false, length = 100)
	private String thickness;

	@Column(name = "thickness_en", length = 100)
	private String thicknessEn;

	@Column(name = "thickness_zh", length = 100)
	private String thicknessZh;

	@Column(nullable = false, length = 100)
	private String moisture;

	@Column(name = "moisture_en", length = 100)
	private String moistureEn;

	@Column(name = "moisture_zh", length = 100)
	private String moistureZh;

	@Column(name = "glue_type", nullable = false, length = 120)
	private String glueType;

	@Column(name = "glue_type_en", length = 120)
	private String glueTypeEn;

	@Column(name = "glue_type_zh", length = 120)
	private String glueTypeZh;

	@Column(nullable = false, length = 150)
	private String size;

	@Column(name = "size_en", length = 150)
	private String sizeEn;

	@Column(name = "size_zh", length = 150)
	private String sizeZh;

	@Column(nullable = false)
	private boolean active = true;

	@Column(name = "featured")
	private Boolean featured = false;

	@ElementCollection(fetch = FetchType.EAGER)
	@CollectionTable(name = "product_applications_vi", joinColumns = @JoinColumn(name = "product_id"))
	@Column(name = "application_value", nullable = false, length = 255)
	private List<String> applicationsVi = new ArrayList<>();

	@ElementCollection(fetch = FetchType.EAGER)
	@CollectionTable(name = "product_applications_en", joinColumns = @JoinColumn(name = "product_id"))
	@Column(name = "application_value", nullable = false, length = 255)
	private List<String> applicationsEn = new ArrayList<>();

	@ElementCollection(fetch = FetchType.EAGER)
	@CollectionTable(name = "product_applications_zh", joinColumns = @JoinColumn(name = "product_id"))
	@Column(name = "application_value", nullable = false, length = 255)
	private List<String> applicationsZh = new ArrayList<>();

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

	public String getNameZh() {
		return nameZh;
	}

	public void setNameZh(String nameZh) {
		this.nameZh = nameZh;
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

	public String getSummaryZh() {
		return summaryZh;
	}

	public void setSummaryZh(String summaryZh) {
		this.summaryZh = summaryZh;
	}

	public String getDetailDescriptionVi() {
		return detailDescriptionVi;
	}

	public void setDetailDescriptionVi(String detailDescriptionVi) {
		this.detailDescriptionVi = detailDescriptionVi;
	}

	public String getDetailDescriptionEn() {
		return detailDescriptionEn;
	}

	public void setDetailDescriptionEn(String detailDescriptionEn) {
		this.detailDescriptionEn = detailDescriptionEn;
	}

	public String getDetailDescriptionZh() {
		return detailDescriptionZh;
	}

	public void setDetailDescriptionZh(String detailDescriptionZh) {
		this.detailDescriptionZh = detailDescriptionZh;
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

	public String getHsCode() {
		return hsCode;
	}

	public void setHsCode(String hsCode) {
		this.hsCode = hsCode;
	}

	public String getPackagingSpec() {
		return packagingSpec;
	}

	public void setPackagingSpec(String packagingSpec) {
		this.packagingSpec = packagingSpec;
	}

	public List<String> getGalleryImageUrls() {
		return galleryImageUrls;
	}

	public void setGalleryImageUrls(List<String> galleryImageUrls) {
		this.galleryImageUrls = new ArrayList<>(galleryImageUrls);
	}

	public List<ProductSpecificationValue> getSpecifications() {
		return specifications;
	}

	public void setSpecifications(List<ProductSpecificationValue> specifications) {
		this.specifications = new ArrayList<>(specifications);
	}

	public List<ProductSpecificationValue> getHighlights() {
		return highlights;
	}

	public void setHighlights(List<ProductSpecificationValue> highlights) {
		this.highlights = new ArrayList<>(highlights);
	}

	public List<ProductSpecificationValue> getQualityControlSteps() {
		return qualityControlSteps;
	}

	public void setQualityControlSteps(List<ProductSpecificationValue> qualityControlSteps) {
		this.qualityControlSteps = new ArrayList<>(qualityControlSteps);
	}

	public String getThickness() {
		return thickness;
	}

	public void setThickness(String thickness) {
		this.thickness = thickness;
	}

	public String getThicknessEn() {
		return thicknessEn;
	}

	public void setThicknessEn(String thicknessEn) {
		this.thicknessEn = thicknessEn;
	}

	public String getThicknessZh() {
		return thicknessZh;
	}

	public void setThicknessZh(String thicknessZh) {
		this.thicknessZh = thicknessZh;
	}

	public String getMoisture() {
		return moisture;
	}

	public void setMoisture(String moisture) {
		this.moisture = moisture;
	}

	public String getMoistureEn() {
		return moistureEn;
	}

	public void setMoistureEn(String moistureEn) {
		this.moistureEn = moistureEn;
	}

	public String getMoistureZh() {
		return moistureZh;
	}

	public void setMoistureZh(String moistureZh) {
		this.moistureZh = moistureZh;
	}

	public String getGlueType() {
		return glueType;
	}

	public void setGlueType(String glueType) {
		this.glueType = glueType;
	}

	public String getGlueTypeEn() {
		return glueTypeEn;
	}

	public void setGlueTypeEn(String glueTypeEn) {
		this.glueTypeEn = glueTypeEn;
	}

	public String getGlueTypeZh() {
		return glueTypeZh;
	}

	public void setGlueTypeZh(String glueTypeZh) {
		this.glueTypeZh = glueTypeZh;
	}

	public String getSize() {
		return size;
	}

	public void setSize(String size) {
		this.size = size;
	}

	public String getSizeEn() {
		return sizeEn;
	}

	public void setSizeEn(String sizeEn) {
		this.sizeEn = sizeEn;
	}

	public String getSizeZh() {
		return sizeZh;
	}

	public void setSizeZh(String sizeZh) {
		this.sizeZh = sizeZh;
	}

	public boolean isActive() {
		return active;
	}

	public void setActive(boolean active) {
		this.active = active;
	}

	public boolean isFeatured() {
		return Boolean.TRUE.equals(featured);
	}

	public void setFeatured(boolean featured) {
		this.featured = featured;
	}

	public List<String> getApplicationsVi() {
		return applicationsVi;
	}

	public void setApplicationsVi(List<String> applicationsVi) {
		this.applicationsVi = new ArrayList<>(applicationsVi);
	}

	public List<String> getApplicationsEn() {
		return applicationsEn;
	}

	public void setApplicationsEn(List<String> applicationsEn) {
		this.applicationsEn = new ArrayList<>(applicationsEn);
	}

	public List<String> getApplicationsZh() {
		return applicationsZh;
	}

	public void setApplicationsZh(List<String> applicationsZh) {
		this.applicationsZh = new ArrayList<>(applicationsZh);
	}
}
