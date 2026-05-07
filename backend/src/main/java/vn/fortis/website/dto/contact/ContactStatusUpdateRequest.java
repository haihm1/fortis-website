package vn.fortis.website.dto.contact;

import jakarta.validation.constraints.NotBlank;

public record ContactStatusUpdateRequest(
		@NotBlank(message = "Status is required")
		String status
) {
}
