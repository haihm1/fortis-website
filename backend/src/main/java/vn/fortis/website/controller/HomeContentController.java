package vn.fortis.website.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import vn.fortis.website.dto.home.HomePageResponse;
import vn.fortis.website.service.HomeContentService;

@RestController
@RequestMapping("/api/public/home")
public class HomeContentController {

	private final HomeContentService homeContentService;

	public HomeContentController(HomeContentService homeContentService) {
		this.homeContentService = homeContentService;
	}

	@GetMapping
	public HomePageResponse getHomePage(@RequestParam(defaultValue = "en") String lang) {
		return homeContentService.getHomePage(lang);
	}
}
