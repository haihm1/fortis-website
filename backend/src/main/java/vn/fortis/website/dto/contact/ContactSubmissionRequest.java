package vn.fortis.website.dto.contact;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ContactSubmissionRequest(
		@NotBlank(message = "Full name is required")
		String fullName,
		String companyName,
		@Email(message = "Email is invalid")
		@NotBlank(message = "Email is required")
		String email,
		String phoneNumber,
		String productInterest,
		String requestedQuantity,
		String targetMarket,
		String specificationDetails,
		@NotBlank(message = "Message is required")
		String message
) {
}
