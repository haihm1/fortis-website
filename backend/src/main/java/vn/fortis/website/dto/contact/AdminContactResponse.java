package vn.fortis.website.dto.contact;

import java.time.LocalDateTime;
import java.util.List;

public record AdminContactResponse(
		List<ContactItem> contacts
) {

	public record ContactItem(
			String id,
			String fullName,
			String companyName,
			String email,
			String phoneNumber,
			String productInterest,
			String requestedQuantity,
			String targetMarket,
			String specificationDetails,
			String attachmentUrl,
			String message,
			String status,
			LocalDateTime createdAt,
			LocalDateTime updatedAt
	) {
	}
}
