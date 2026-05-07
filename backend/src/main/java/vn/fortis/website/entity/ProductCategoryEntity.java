package vn.fortis.website.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "product_categories")
public class ProductCategoryEntity extends BaseAuditEntity {

	@Id
	private String id;

	@Column(nullable = false, unique = true, length = 120)
	private String slug;

	@Column(name = "name_vi", nullable = false, length = 150)
	private String nameVi;

	@Column(name = "name_en", nullable = false, length = 150)
	private String nameEn;

	@Column(name = "description_vi", nullable = false, length = 500)
	private String descriptionVi;

	@Column(name = "description_en", nullable = false, length = 500)
	private String descriptionEn;

	@Column(nullable = false)
	private boolean active = true;

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

	public String getDescriptionVi() {
		return descriptionVi;
	}

	public void setDescriptionVi(String descriptionVi) {
		this.descriptionVi = descriptionVi;
	}

	public String getDescriptionEn() {
		return descriptionEn;
	}

	public void setDescriptionEn(String descriptionEn) {
		this.descriptionEn = descriptionEn;
	}

	public boolean isActive() {
		return active;
	}

	public void setActive(boolean active) {
		this.active = active;
	}
}
