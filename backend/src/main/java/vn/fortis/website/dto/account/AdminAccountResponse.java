package vn.fortis.website.dto.account;

import java.util.List;

public record AdminAccountResponse(
		List<AccountItem> accounts
) {

	public record AccountItem(
			String id,
			String username,
			String displayName,
			String email,
			boolean active,
			List<String> roles
	) {
	}
}
