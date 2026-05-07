package vn.fortis.website.dto.account;

import java.util.List;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

public record AdminAccountUpsertRequest(
		@NotBlank(message = "Username is required")
		String username,
		@NotBlank(message = "Display name is required")
		String displayName,
		@Email(message = "Email is invalid")
		@NotBlank(message = "Email is required")
		String email,
		boolean active,
		@NotEmpty(message = "At least one role is required")
		List<String> roles
) {
}
