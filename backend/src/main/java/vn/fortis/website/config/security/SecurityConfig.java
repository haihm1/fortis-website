package vn.fortis.website.config.security;

import java.util.Collection;
import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

	private final JwtTokenService jwtTokenService;

	public SecurityConfig(JwtTokenService jwtTokenService) {
		this.jwtTokenService = jwtTokenService;
	}

	@Bean
	SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http
				.cors(Customizer.withDefaults())
				.csrf(AbstractHttpConfigurer::disable)
				.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.httpBasic(AbstractHttpConfigurer::disable)
				.formLogin(AbstractHttpConfigurer::disable)
				.authorizeHttpRequests(authorize -> authorize
						.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
						.requestMatchers(HttpMethod.GET, "/", "/health").permitAll()
						.requestMatchers("/api/public/**", "/api/auth/login", "/uploads/**").permitAll()
						.requestMatchers("/api/auth/me").authenticated()
						.requestMatchers("/api/admin/contacts/**").hasAnyRole("SUPER_ADMIN", "CONTACT_MANAGER")
						.requestMatchers("/api/admin/content/**").hasAnyRole("SUPER_ADMIN", "CONTENT_EDITOR", "CONTENT_PUBLISHER")
						.requestMatchers("/api/admin/accounts/**").hasAnyRole("SUPER_ADMIN", "ACCOUNT_MANAGER")
						.requestMatchers("/api/admin/catalog/**").hasAnyRole("SUPER_ADMIN", "CONTENT_EDITOR", "CONTENT_PUBLISHER")
						.anyRequest().authenticated()
				)
				.oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter())))
				.logout(Customizer.withDefaults());

		return http.build();
	}

	@Bean
	JwtDecoder jwtDecoder() {
		return jwtTokenService.jwtDecoder();
	}

	@Bean
	Converter<Jwt, ? extends AbstractAuthenticationToken> jwtAuthenticationConverter() {
		JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
		converter.setJwtGrantedAuthoritiesConverter(jwt -> extractAuthorities(jwt));
		return converter;
	}

	private Collection<GrantedAuthority> extractAuthorities(Jwt jwt) {
		List<String> roles = jwt.getClaimAsStringList("roles");
		if (roles == null) {
			return List.of();
		}

		return roles.stream()
				.map(role -> role.startsWith("ROLE_") ? role : "ROLE_" + role)
				.map(SimpleGrantedAuthority::new)
				.map(GrantedAuthority.class::cast)
				.toList();
	}
}
