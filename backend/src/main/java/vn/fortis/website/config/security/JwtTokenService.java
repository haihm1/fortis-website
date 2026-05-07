package vn.fortis.website.config.security;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.stereotype.Service;

import com.nimbusds.jose.jwk.source.ImmutableSecret;

import vn.fortis.website.service.account.AccountManagementService.AuthenticatedAccount;

@Service
public class JwtTokenService {

	private final SecretKey secretKey;
	private final JwtEncoder jwtEncoder;
	private final JwtDecoder jwtDecoder;
	private final long expirationSeconds;

	public JwtTokenService(
			@Value("${app.security.jwt-secret}") String jwtSecret,
			@Value("${app.security.jwt-expiration-seconds}") long expirationSeconds
	) {
		this.secretKey = new SecretKeySpec(jwtSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
		this.jwtEncoder = new NimbusJwtEncoder(new ImmutableSecret<>(secretKey));
		this.jwtDecoder = NimbusJwtDecoder.withSecretKey(secretKey)
				.macAlgorithm(MacAlgorithm.HS256)
				.build();
		this.expirationSeconds = expirationSeconds;
	}

	public String generateToken(AuthenticatedAccount account) {
		Instant now = Instant.now();
		JwtClaimsSet claims = JwtClaimsSet.builder()
				.subject(account.username())
				.issuedAt(now)
				.expiresAt(now.plusSeconds(expirationSeconds))
				.claim("accountId", account.id())
				.claim("displayName", account.displayName())
				.claim("email", account.email())
				.claim("roles", List.copyOf(account.roles()))
				.build();

		JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
		return jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
	}

	public JwtDecoder jwtDecoder() {
		return jwtDecoder;
	}

	public long expirationSeconds() {
		return expirationSeconds;
	}
}
