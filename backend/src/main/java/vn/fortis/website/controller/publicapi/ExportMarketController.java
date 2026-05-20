package vn.fortis.website.controller.publicapi;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import vn.fortis.website.dto.exportmarket.ExportMarketDetailResponse;
import vn.fortis.website.dto.exportmarket.ExportMarketListResponse;
import vn.fortis.website.service.exportmarket.ExportMarketService;

@RestController
@RequestMapping("/api/public/export-market")
public class ExportMarketController {

	private final ExportMarketService exportMarketService;

	public ExportMarketController(ExportMarketService exportMarketService) {
		this.exportMarketService = exportMarketService;
	}

	@GetMapping
	public ExportMarketListResponse getArticles(@RequestParam(defaultValue = "en") String lang) {
		return exportMarketService.getArticles(lang);
	}

	@GetMapping("/{slug}")
	public ExportMarketDetailResponse getArticle(
			@PathVariable String slug,
			@RequestParam(defaultValue = "en") String lang
	) {
		return exportMarketService.getArticle(slug, lang);
	}
}
