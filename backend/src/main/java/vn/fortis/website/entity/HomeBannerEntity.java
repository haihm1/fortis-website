package vn.fortis.website.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "home_banners")
public class HomeBannerEntity extends BaseAuditEntity {

	@Id
	private Integer slot;

	@Column(name = "title_vi", nullable = false, length = 255)
	private String titleVi;

	@Column(name = "title_en", nullable = false, length = 255)
	private String titleEn;

	@Column(name = "description_vi", nullable = false, columnDefinition = "TEXT")
	private String descriptionVi;

	@Column(name = "description_en", nullable = false, columnDefinition = "TEXT")
	private String descriptionEn;

	@Column(name = "overlay_label", nullable = false, length = 150)
	private String overlayLabel;

	@Column(name = "image_url", nullable = false, length = 500)
	private String imageUrl;

	public Integer getSlot() {
		return slot;
	}

	public void setSlot(Integer slot) {
		this.slot = slot;
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

	public String getOverlayLabel() {
		return overlayLabel;
	}

	public void setOverlayLabel(String overlayLabel) {
		this.overlayLabel = overlayLabel;
	}

	public String getImageUrl() {
		return imageUrl;
	}

	public void setImageUrl(String imageUrl) {
		this.imageUrl = imageUrl;
	}
}
