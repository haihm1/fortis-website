package vn.fortis.website.entity;

import java.util.LinkedHashSet;
import java.util.Set;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;

@Entity
@Table(name = "admin_accounts")
public class AdminAccountEntity extends BaseAuditEntity {

	@Id
	private String id;

	@Column(nullable = false, unique = true, length = 100)
	private String username;

	@Column(name = "display_name", nullable = false, length = 150)
	private String displayName;

	@Column(nullable = false, length = 150)
	private String email;

	@Column(nullable = false)
	private boolean active;

	@Column(name = "password_hash", nullable = false, length = 255)
	private String passwordHash;

	@ElementCollection(fetch = FetchType.EAGER)
	@CollectionTable(name = "admin_account_roles", joinColumns = @JoinColumn(name = "account_id"))
	@Column(name = "role_name", nullable = false, length = 80)
	private Set<String> roles = new LinkedHashSet<>();

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getDisplayName() {
		return displayName;
	}

	public void setDisplayName(String displayName) {
		this.displayName = displayName;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public boolean isActive() {
		return active;
	}

	public void setActive(boolean active) {
		this.active = active;
	}

	public String getPasswordHash() {
		return passwordHash;
	}

	public void setPasswordHash(String passwordHash) {
		this.passwordHash = passwordHash;
	}

	public Set<String> getRoles() {
		return roles;
	}

	public void setRoles(Set<String> roles) {
		this.roles = roles;
	}
}
