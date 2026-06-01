package vn.fortis.website.dto.customer;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

public record AdminCustomerUpsertRequest(
		@NotBlank(message = "Customer name is required")
		String customerName,
		String country,
		String company,
		String positionTitle,
		List<String> phoneNumbers,
		String email,
		List<@Valid ContactApplicationItem> contactApplications,
		String website,
		String mainProduct,
		String contactStatus,
		String hsCode,
		String packingSpecification,
		String labelingRequirement,
		String incoterms,
		String destinationPort,
		String preferredShippingMethod,
		String expectedTransitTime,
		String paymentMethod,
		String requiredDocuments,
		String notes
) {

	public record ContactApplicationItem(
			@NotBlank(message = "Phone number is required for contact application")
			String phoneNumber,
			@NotBlank(message = "Contact application is required")
			String application
	) {
	}
}
