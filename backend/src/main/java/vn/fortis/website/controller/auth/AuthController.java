package vn.fortis.website.controller.auth;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import vn.fortis.website.config.security.JwtTokenService;
import vn.fortis.website.dto.auth.AdminAuthResponse;
import vn.fortis.website.dto.auth.AdminLoginRequest;
import vn.fortis.website.service.account.AccountManagementService;
import vn.fortis.website.service.account.AccountManagementService.AuthenticatedAccount;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

	private final AccountManagementService accountManagementService;
	private final JwtTokenService jwtTokenService;

	public AuthController(
			AccountManagementService accountManagementService,
			JwtTokenService jwtTokenService
	) {
		this.accountManagementService = accountManagementService;
		this.jwtTokenService = jwtTokenService;
	}

	@PostMapping("/login")
	public AdminAuthResponse login(@Valid @RequestBody AdminLoginRequest request) {
		AuthenticatedAccount account = accountManagementService.authenticate(
				request.username(),
				request.password()
		);
		return toAuthResponse(account);
	}

	@GetMapping("/me")
	public AdminAuthResponse.AdminUserProfile me(@AuthenticationPrincipal Jwt jwt) {
		AuthenticatedAccount account = accountManagementService.getAuthenticatedAccount(jwt.getSubject());
		return toUserProfile(account);
	}

	private AdminAuthResponse toAuthResponse(AuthenticatedAccount account) {
		return new AdminAuthResponse(
				jwtTokenService.generateToken(account),
				"Bearer",
				jwtTokenService.expirationSeconds(),
				toUserProfile(account)
		);
	}

	private AdminAuthResponse.AdminUserProfile toUserProfile(AuthenticatedAccount account) {
		return new AdminAuthResponse.AdminUserProfile(
				account.id(),
				account.username(),
				account.displayName(),
				account.email(),
				account.roles()
		);
	}
}
