package vn.fortis.website.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class CustomerContactChannelValue {

	@Column(name = "phone_number", nullable = false, length = 80)
	private String phoneNumber;

	@Column(name = "application", nullable = false, length = 40)
	private String application;

	public String getPhoneNumber() {
		return phoneNumber;
	}

	public void setPhoneNumber(String phoneNumber) {
		this.phoneNumber = phoneNumber;
	}

	public String getApplication() {
		return application;
	}

	public void setApplication(String application) {
		this.application = application;
	}
}
