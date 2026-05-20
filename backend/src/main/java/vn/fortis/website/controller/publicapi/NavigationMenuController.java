package vn.fortis.website.controller.publicapi;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import vn.fortis.website.dto.navigation.NavigationMenuResponse;
import vn.fortis.website.service.navigation.NavigationMenuService;

@RestController
@RequestMapping("/api/public/navigation")
public class NavigationMenuController {

	private final NavigationMenuService navigationMenuService;

	public NavigationMenuController(NavigationMenuService navigationMenuService) {
		this.navigationMenuService = navigationMenuService;
	}

	@GetMapping
	public NavigationMenuResponse getNavigation(@RequestParam(defaultValue = "en") String lang) {
		return navigationMenuService.getPublicMenu(lang);
	}
}
