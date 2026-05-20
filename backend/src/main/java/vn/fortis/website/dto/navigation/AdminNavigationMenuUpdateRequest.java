package vn.fortis.website.dto.navigation;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record AdminNavigationMenuUpdateRequest(
		@NotEmpty(message = "Menu items are required")
		List<@Valid MenuItemUpdate> items
) {

	public record MenuItemUpdate(
			@NotBlank(message = "Menu key is required")
			String key,
			@NotBlank(message = "Vietnamese label is required")
			String labelVi,
			@NotBlank(message = "English label is required")
			String labelEn,
			String labelZh,
			@NotBlank(message = "Path is required")
			String path,
			int sortOrder,
			@NotNull(message = "Visible flag is required")
			Boolean visible
	) {
	}
}
