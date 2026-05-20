package vn.fortis.website.controller.admin;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import vn.fortis.website.dto.navigation.AdminNavigationMenuUpdateRequest;
import vn.fortis.website.dto.navigation.NavigationMenuResponse;
import vn.fortis.website.service.navigation.NavigationMenuService;

@RestController
@RequestMapping("/api/admin/navigation")
public class NavigationMenuAdminController {

	private final NavigationMenuService navigationMenuService;

	public NavigationMenuAdminController(NavigationMenuService navigationMenuService) {
		this.navigationMenuService = navigationMenuService;
	}

	@GetMapping
	public NavigationMenuResponse getNavigation() {
		return navigationMenuService.getAdminMenu();
	}

	@PutMapping
	public NavigationMenuResponse updateNavigation(@Valid @RequestBody AdminNavigationMenuUpdateRequest request) {
		return navigationMenuService.updateAdminMenu(request);
	}
}
