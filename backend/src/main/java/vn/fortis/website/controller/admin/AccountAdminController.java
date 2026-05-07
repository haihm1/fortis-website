package vn.fortis.website.controller.admin;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import vn.fortis.website.dto.account.AdminAccountResponse;
import vn.fortis.website.dto.account.AdminAccountUpsertRequest;
import vn.fortis.website.dto.account.ChangePasswordRequest;
import vn.fortis.website.dto.account.PasswordChangeResponse;
import vn.fortis.website.service.account.AccountManagementService;

@RestController
@RequestMapping("/api/admin/accounts")
public class AccountAdminController {

	private final AccountManagementService accountManagementService;

	public AccountAdminController(AccountManagementService accountManagementService) {
		this.accountManagementService = accountManagementService;
	}

	@GetMapping
	public AdminAccountResponse getAccounts() {
		return accountManagementService.getAccounts();
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public AdminAccountResponse.AccountItem createAccount(@Valid @RequestBody AdminAccountUpsertRequest request) {
		return accountManagementService.createAccount(request);
	}

	@PutMapping("/{accountId}")
	public AdminAccountResponse.AccountItem updateAccount(
			@PathVariable String accountId,
			@Valid @RequestBody AdminAccountUpsertRequest request
	) {
		return accountManagementService.updateAccount(accountId, request);
	}

	@PostMapping("/{accountId}/change-password")
	public PasswordChangeResponse changePassword(
			@PathVariable String accountId,
			@Valid @RequestBody ChangePasswordRequest request
	) {
		return accountManagementService.changePassword(accountId, request);
	}
}
