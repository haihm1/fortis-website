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
import jakarta.persistence.Table;

@Entity
@Table(name = "customer_leads")
public class CustomerLeadEntity extends BaseAuditEntity {

	@Id
	private String id;

	@Column(name = "customer_name", nullable = false, length = 150)
	private String customerName;

	@Column(length = 120)
	private String country;

	@Column(length = 180)
	private String company;

	@Column(name = "position_title", length = 150)
	private String positionTitle;

	@ElementCollection(fetch = FetchType.EAGER)
	@CollectionTable(name = "customer_lead_phone_numbers", joinColumns = @JoinColumn(name = "customer_id"))
	@Column(name = "phone_number", nullable = false, length = 80)
	private List<String> phoneNumbers = new ArrayList<>();

	@Column(length = 180)
	private String email;

	@ElementCollection(fetch = FetchType.EAGER)
	@CollectionTable(name = "customer_lead_contact_channels", joinColumns = @JoinColumn(name = "customer_id"))
	private List<CustomerContactChannelValue> contactApplications = new ArrayList<>();

	@Column(length = 500)
	private String website;

	@Column(name = "main_product", length = 180)
	private String mainProduct;

	@Column(name = "contact_status", nullable = false, length = 40)
	private String contactStatus;

	@Column(name = "hs_code", length = 80)
	private String hsCode;

	@Column(name = "packing_specification", columnDefinition = "TEXT")
	private String packingSpecification;

	@Column(name = "labeling_requirement", columnDefinition = "TEXT")
	private String labelingRequirement;

	@Column(length = 80)
	private String incoterms;

	@Column(name = "destination_port", length = 150)
	private String destinationPort;

	@Column(name = "preferred_shipping_method", length = 120)
	private String preferredShippingMethod;

	@Column(name = "expected_transit_time", length = 120)
	private String expectedTransitTime;

	@Column(name = "payment_method", length = 150)
	private String paymentMethod;

	@Column(name = "required_documents", columnDefinition = "TEXT")
	private String requiredDocuments;

	@Column(columnDefinition = "TEXT")
	private String notes;

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getCustomerName() {
		return customerName;
	}

	public void setCustomerName(String customerName) {
		this.customerName = customerName;
	}

	public String getCountry() {
		return country;
	}

	public void setCountry(String country) {
		this.country = country;
	}

	public String getCompany() {
		return company;
	}

	public void setCompany(String company) {
		this.company = company;
	}

	public String getPositionTitle() {
		return positionTitle;
	}

	public void setPositionTitle(String positionTitle) {
		this.positionTitle = positionTitle;
	}

	public List<String> getPhoneNumbers() {
		return phoneNumbers;
	}

	public void setPhoneNumbers(List<String> phoneNumbers) {
		this.phoneNumbers = new ArrayList<>(phoneNumbers);
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public List<CustomerContactChannelValue> getContactApplications() {
		return contactApplications;
	}

	public void setContactApplications(List<CustomerContactChannelValue> contactApplications) {
		this.contactApplications = new ArrayList<>(contactApplications);
	}

	public String getWebsite() {
		return website;
	}

	public void setWebsite(String website) {
		this.website = website;
	}

	public String getMainProduct() {
		return mainProduct;
	}

	public void setMainProduct(String mainProduct) {
		this.mainProduct = mainProduct;
	}

	public String getContactStatus() {
		return contactStatus;
	}

	public void setContactStatus(String contactStatus) {
		this.contactStatus = contactStatus;
	}

	public String getHsCode() {
		return hsCode;
	}

	public void setHsCode(String hsCode) {
		this.hsCode = hsCode;
	}

	public String getPackingSpecification() {
		return packingSpecification;
	}

	public void setPackingSpecification(String packingSpecification) {
		this.packingSpecification = packingSpecification;
	}

	public String getLabelingRequirement() {
		return labelingRequirement;
	}

	public void setLabelingRequirement(String labelingRequirement) {
		this.labelingRequirement = labelingRequirement;
	}

	public String getIncoterms() {
		return incoterms;
	}

	public void setIncoterms(String incoterms) {
		this.incoterms = incoterms;
	}

	public String getDestinationPort() {
		return destinationPort;
	}

	public void setDestinationPort(String destinationPort) {
		this.destinationPort = destinationPort;
	}

	public String getPreferredShippingMethod() {
		return preferredShippingMethod;
	}

	public void setPreferredShippingMethod(String preferredShippingMethod) {
		this.preferredShippingMethod = preferredShippingMethod;
	}

	public String getExpectedTransitTime() {
		return expectedTransitTime;
	}

	public void setExpectedTransitTime(String expectedTransitTime) {
		this.expectedTransitTime = expectedTransitTime;
	}

	public String getPaymentMethod() {
		return paymentMethod;
	}

	public void setPaymentMethod(String paymentMethod) {
		this.paymentMethod = paymentMethod;
	}

	public String getRequiredDocuments() {
		return requiredDocuments;
	}

	public void setRequiredDocuments(String requiredDocuments) {
		this.requiredDocuments = requiredDocuments;
	}

	public String getNotes() {
		return notes;
	}

	public void setNotes(String notes) {
		this.notes = notes;
	}
}
