package vn.fortis.website.dto.auth;

import java.util.List;

public record AdminAuthResponse(
		String accessToken,
		String tokenType,
		long expiresInSeconds,
		AdminUserProfile user
) {

	public record AdminUserProfile(
			String id,
			String username,
			String displayName,
			String email,
			List<String> roles
	) {
	}
}
