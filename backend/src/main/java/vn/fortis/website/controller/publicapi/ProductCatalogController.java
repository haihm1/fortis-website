package vn.fortis.website.controller.publicapi;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import vn.fortis.website.dto.catalog.ProductCatalogResponse;
import vn.fortis.website.service.catalog.ProductCatalogService;

@RestController
@RequestMapping("/api/public/catalog")
public class ProductCatalogController {

	private final ProductCatalogService productCatalogService;

	public ProductCatalogController(ProductCatalogService productCatalogService) {
		this.productCatalogService = productCatalogService;
	}

	@GetMapping
	public ProductCatalogResponse getCatalog(@RequestParam(defaultValue = "en") String lang) {
		return productCatalogService.getPublicCatalog(lang);
	}
}
