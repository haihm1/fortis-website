package vn.fortis.website.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class ExportOrderStatusHistoryValue {

	@Column(nullable = false, length = 50)
	private String status;

	@Column(columnDefinition = "TEXT")
	private String note;

	@Column(name = "changed_at", nullable = false)
	private LocalDateTime changedAt;

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public String getNote() {
		return note;
	}

	public void setNote(String note) {
		this.note = note;
	}

	public LocalDateTime getChangedAt() {
		return changedAt;
	}

	public void setChangedAt(LocalDateTime changedAt) {
		this.changedAt = changedAt;
	}
}
