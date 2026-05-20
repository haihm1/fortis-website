package vn.fortis.website.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "navigation_menus")
public class NavigationMenuEntity extends BaseAuditEntity {

	@Id
	@Column(name = "menu_key", length = 80)
	private String key;

	@Column(name = "label_vi", nullable = false, length = 120)
	private String labelVi;

	@Column(name = "label_en", nullable = false, length = 120)
	private String labelEn;

	@Column(name = "label_zh", length = 120)
	private String labelZh;

	@Column(nullable = false, length = 180)
	private String path;

	@Column(name = "sort_order", nullable = false)
	private int sortOrder;

	@Column(nullable = false)
	private boolean visible = true;

	public String getKey() {
		return key;
	}

	public void setKey(String key) {
		this.key = key;
	}

	public String getLabelVi() {
		return labelVi;
	}

	public void setLabelVi(String labelVi) {
		this.labelVi = labelVi;
	}

	public String getLabelEn() {
		return labelEn;
	}

	public void setLabelEn(String labelEn) {
		this.labelEn = labelEn;
	}

	public String getLabelZh() {
		return labelZh;
	}

	public void setLabelZh(String labelZh) {
		this.labelZh = labelZh;
	}

	public String getPath() {
		return path;
	}

	public void setPath(String path) {
		this.path = path;
	}

	public int getSortOrder() {
		return sortOrder;
	}

	public void setSortOrder(int sortOrder) {
		this.sortOrder = sortOrder;
	}

	public boolean isVisible() {
		return visible;
	}

	public void setVisible(boolean visible) {
		this.visible = visible;
	}
}
