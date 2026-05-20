package vn.fortis.website.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class ProductSpecificationValue {

	@Column(name = "sort_order", nullable = false)
	private int sortOrder;

	@Column(name = "label_vi", nullable = false, length = 120)
	private String labelVi;

	@Column(name = "label_en", length = 120)
	private String labelEn;

	@Column(name = "label_zh", length = 120)
	private String labelZh;

	@Column(name = "value_vi", nullable = false, length = 255)
	private String valueVi;

	@Column(name = "value_en", length = 255)
	private String valueEn;

	@Column(name = "value_zh", length = 255)
	private String valueZh;

	public int getSortOrder() {
		return sortOrder;
	}

	public void setSortOrder(int sortOrder) {
		this.sortOrder = sortOrder;
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

	public String getValueVi() {
		return valueVi;
	}

	public void setValueVi(String valueVi) {
		this.valueVi = valueVi;
	}

	public String getValueEn() {
		return valueEn;
	}

	public void setValueEn(String valueEn) {
		this.valueEn = valueEn;
	}

	public String getValueZh() {
		return valueZh;
	}

	public void setValueZh(String valueZh) {
		this.valueZh = valueZh;
	}
}
