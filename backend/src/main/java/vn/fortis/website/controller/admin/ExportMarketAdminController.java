package vn.fortis.website.controller.admin;

import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import vn.fortis.website.dto.exportmarket.AdminExportMarketResponse;
import vn.fortis.website.dto.exportmarket.AdminExportMarketUpsertRequest;
import vn.fortis.website.service.exportmarket.ExportMarketService;

@Validated
@RestController
@RequestMapping("/api/admin/export-market")
public class ExportMarketAdminController {

	private final ExportMarketService exportMarketService;

	public ExportMarketAdminController(ExportMarketService exportMarketService) {
		this.exportMarketService = exportMarketService;
	}

	@GetMapping
	public AdminExportMarketResponse getArticles() {
		return exportMarketService.getAdminArticles();
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public AdminExportMarketResponse.ArticleAdminItem createArticle(
			@Valid @RequestBody AdminExportMarketUpsertRequest request
	) {
		return exportMarketService.createArticle(request);
	}

	@PutMapping("/{articleId}")
	public AdminExportMarketResponse.ArticleAdminItem updateArticle(
			@PathVariable String articleId,
			@Valid @RequestBody AdminExportMarketUpsertRequest request
	) {
		return exportMarketService.updateArticle(articleId, request);
	}

	@DeleteMapping("/{articleId}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void deleteArticle(@PathVariable String articleId) {
		exportMarketService.deleteArticle(articleId);
	}
}
