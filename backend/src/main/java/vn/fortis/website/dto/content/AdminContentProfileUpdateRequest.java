package vn.fortis.website.dto.content;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record AdminContentProfileUpdateRequest(
		@NotBlank(message = "Vietnamese article is required")
		String aboutArticleVi,
		@NotBlank(message = "English article is required")
		String aboutArticleEn,
		@NotBlank(message = "Address is required")
		String address,
		@NotBlank(message = "Hotline is required")
		String hotline,
		@Email(message = "Email is invalid")
		@NotBlank(message = "Email is required")
		String email
) {
}
