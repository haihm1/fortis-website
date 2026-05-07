package vn.fortis.website.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "contact_requests")
public class ContactRequestEntity extends BaseAuditEntity {

	@Id
	private String id;

	@Column(name = "full_name", nullable = false, length = 150)
	private String fullName;

	@Column(name = "company_name", length = 150)
	private String companyName;

	@Column(nullable = false, length = 150)
	private String email;

	@Column(name = "phone_number", length = 50)
	private String phoneNumber;

	@Column(name = "product_interest", length = 200)
	private String productInterest;

	@Column(name = "requested_quantity", length = 120)
	private String requestedQuantity;

	@Column(name = "target_market", length = 120)
	private String targetMarket;

	@Column(name = "specification_details", columnDefinition = "TEXT")
	private String specificationDetails;

	@Column(name = "attachment_url", length = 500)
	private String attachmentUrl;

	@Column(nullable = false, columnDefinition = "TEXT")
	private String message;

	@Column(nullable = false, length = 40)
	private String status;

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getFullName() {
		return fullName;
	}

	public void setFullName(String fullName) {
		this.fullName = fullName;
	}

	public String getCompanyName() {
		return companyName;
	}

	public void setCompanyName(String companyName) {
		this.companyName = companyName;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getPhoneNumber() {
		return phoneNumber;
	}

	public void setPhoneNumber(String phoneNumber) {
		this.phoneNumber = phoneNumber;
	}

	public String getProductInterest() {
		return productInterest;
	}

	public void setProductInterest(String productInterest) {
		this.productInterest = productInterest;
	}

	public String getRequestedQuantity() {
		return requestedQuantity;
	}

	public void setRequestedQuantity(String requestedQuantity) {
		this.requestedQuantity = requestedQuantity;
	}

	public String getTargetMarket() {
		return targetMarket;
	}

	public void setTargetMarket(String targetMarket) {
		this.targetMarket = targetMarket;
	}

	public String getSpecificationDetails() {
		return specificationDetails;
	}

	public void setSpecificationDetails(String specificationDetails) {
		this.specificationDetails = specificationDetails;
	}

	public String getAttachmentUrl() {
		return attachmentUrl;
	}

	public void setAttachmentUrl(String attachmentUrl) {
		this.attachmentUrl = attachmentUrl;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}
}
