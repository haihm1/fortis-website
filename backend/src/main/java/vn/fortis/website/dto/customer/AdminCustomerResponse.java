package vn.fortis.website.dto.customer;

import java.time.LocalDateTime;
import java.util.List;

public record AdminCustomerResponse(
		List<CustomerItem> customers
) {

	public record CustomerItem(
			String id,
			String customerName,
			String country,
			String company,
			String positionTitle,
			List<String> phoneNumbers,
			String email,
			List<ContactApplicationItem> contactApplications,
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
			String notes,
			LocalDateTime createdAt,
			LocalDateTime updatedAt
	) {
	}

	public record ContactApplicationItem(
			String phoneNumber,
			String application
	) {
	}
}
