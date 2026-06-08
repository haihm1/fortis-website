package vn.fortis.website.service.account;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import vn.fortis.website.dto.account.AdminAccountResponse;
import vn.fortis.website.dto.account.AdminAccountUpsertRequest;
import vn.fortis.website.dto.account.ChangePasswordRequest;
import vn.fortis.website.dto.account.PasswordChangeResponse;
import vn.fortis.website.entity.AdminAccountEntity;
import vn.fortis.website.repository.AdminAccountRepository;

@Service
public class AccountManagementService {

	private static final Set<String> ALLOWED_ROLES = Set.of(
			"SUPER_ADMIN",
			"CONTENT_EDITOR",
			"CONTENT_PUBLISHER",
			"CONTACT_MANAGER",
			"EXPORT_MANAGER",
			"ACCOUNT_MANAGER"
	);

	private final AdminAccountRepository adminAccountRepository;
	private final PasswordEncoder passwordEncoder;

	public AccountManagementService(
			AdminAccountRepository adminAccountRepository,
			PasswordEncoder passwordEncoder
	) {
		this.adminAccountRepository = adminAccountRepository;
		this.passwordEncoder = passwordEncoder;
	}

	public synchronized AdminAccountResponse getAccounts() {
		return new AdminAccountResponse(
				adminAccountRepository.findAll().stream().map(this::mapAccount).toList()
		);
	}

	public synchronized AuthenticatedAccount authenticate(String username, String rawPassword) {
		AdminAccountEntity account = adminAccountRepository.findByUsernameIgnoreCase(username.trim())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

		if (!account.isActive()) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account is inactive");
		}

		if (!passwordEncoder.matches(rawPassword, account.getPasswordHash())) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
		}

		return mapAuthenticatedAccount(account);
	}

	public synchronized AuthenticatedAccount getAuthenticatedAccount(String username) {
		AdminAccountEntity account = adminAccountRepository.findByUsernameIgnoreCase(username.trim())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found"));

		if (!account.isActive()) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account is inactive");
		}

		return mapAuthenticatedAccount(account);
	}

	public synchronized AdminAccountResponse.AccountItem createAccount(AdminAccountUpsertRequest request) {
		validateUniqueUsername(request.username(), null);
		List<String> normalizedRoles = normalizeRoles(request.roles());
		AdminAccountEntity account = new AdminAccountEntity();
		account.setId(UUID.randomUUID().toString());
		account.setUsername(request.username().trim());
		account.setDisplayName(request.displayName().trim());
		account.setEmail(request.email().trim());
		account.setActive(request.active());
		account.setRoles(new LinkedHashSet<>(normalizedRoles));
		account.setPasswordHash(passwordEncoder.encode("ChangeMe@123"));
		account = adminAccountRepository.save(account);
		return mapAccount(account);
	}

	public synchronized AdminAccountResponse.AccountItem updateAccount(
			String accountId,
			AdminAccountUpsertRequest request
	) {
		AdminAccountEntity existingAccount = requireAccount(accountId);
		validateUniqueUsername(request.username(), accountId);
		List<String> normalizedRoles = normalizeRoles(request.roles());
		existingAccount.setUsername(request.username().trim());
		existingAccount.setDisplayName(request.displayName().trim());
		existingAccount.setEmail(request.email().trim());
		existingAccount.setActive(request.active());
		existingAccount.setRoles(new LinkedHashSet<>(normalizedRoles));
		return mapAccount(adminAccountRepository.save(existingAccount));
	}

	public synchronized PasswordChangeResponse changePassword(
			String accountId,
			ChangePasswordRequest request
	) {
		AdminAccountEntity existingAccount = requireAccount(accountId);
		if (!passwordEncoder.matches(request.currentPassword(), existingAccount.getPasswordHash())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is invalid");
		}

		existingAccount.setPasswordHash(passwordEncoder.encode(request.newPassword()));
		adminAccountRepository.save(existingAccount);
		return new PasswordChangeResponse(accountId, "Password updated successfully");
	}

	private AdminAccountEntity requireAccount(String accountId) {
		return adminAccountRepository.findById(accountId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found"));
	}

	private void validateUniqueUsername(String username, String currentAccountId) {
		boolean duplicated = adminAccountRepository.findByUsernameIgnoreCase(username.trim())
				.map(account -> !account.getId().equals(currentAccountId))
				.orElse(false);
		if (duplicated) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username already exists");
		}
	}

	private List<String> normalizeRoles(List<String> roles) {
		Set<String> normalizedRoles = new LinkedHashSet<>();
		for (String role : roles) {
			String normalized = role == null ? "" : role.trim().toUpperCase();
			if (!ALLOWED_ROLES.contains(normalized)) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported role: " + role);
			}
			normalizedRoles.add(normalized);
		}
		return List.copyOf(normalizedRoles);
	}

	private AdminAccountResponse.AccountItem mapAccount(AdminAccountEntity account) {
		return new AdminAccountResponse.AccountItem(
				account.getId(),
				account.getUsername(),
				account.getDisplayName(),
				account.getEmail(),
				account.isActive(),
				List.copyOf(account.getRoles())
		);
	}

	private AuthenticatedAccount mapAuthenticatedAccount(AdminAccountEntity account) {
		return new AuthenticatedAccount(
				account.getId(),
				account.getUsername(),
				account.getDisplayName(),
				account.getEmail(),
				List.copyOf(account.getRoles())
		);
	}

	public record AuthenticatedAccount(
			String id,
			String username,
			String displayName,
			String email,
			List<String> roles
	) {
	}
}
