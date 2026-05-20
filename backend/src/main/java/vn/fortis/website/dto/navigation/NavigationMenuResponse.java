package vn.fortis.website.dto.navigation;

import java.util.List;

public record NavigationMenuResponse(
		String locale,
		List<MenuItem> items
) {

	public record MenuItem(
			String key,
			String label,
			String labelVi,
			String labelEn,
			String labelZh,
			String path,
			int sortOrder,
			boolean visible
	) {
	}
}
