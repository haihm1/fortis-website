package vn.fortis.website.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "content_profiles")
public class ContentProfileEntity extends BaseAuditEntity {

	@Id
	private String id;

	@Column(name = "about_article_vi", nullable = false, columnDefinition = "TEXT")
	private String aboutArticleVi;

	@Column(name = "about_article_en", nullable = false, columnDefinition = "TEXT")
	private String aboutArticleEn;

	@Column(nullable = false, length = 255)
	private String address;

	@Column(nullable = false, length = 60)
	private String hotline;

	@Column(nullable = false, length = 150)
	private String email;

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getAboutArticleVi() {
		return aboutArticleVi;
	}

	public void setAboutArticleVi(String aboutArticleVi) {
		this.aboutArticleVi = aboutArticleVi;
	}

	public String getAboutArticleEn() {
		return aboutArticleEn;
	}

	public void setAboutArticleEn(String aboutArticleEn) {
		this.aboutArticleEn = aboutArticleEn;
	}

	public String getAddress() {
		return address;
	}

	public void setAddress(String address) {
		this.address = address;
	}

	public String getHotline() {
		return hotline;
	}

	public void setHotline(String hotline) {
		this.hotline = hotline;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}
}
