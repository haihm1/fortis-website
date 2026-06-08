package vn.fortis.website.dto.exportorder;

import jakarta.validation.constraints.NotBlank;

public record AdminExportOrderStatusUpdateRequest(
		@NotBlank(message = "Status is required")
		String status,
		String note
) {
}
