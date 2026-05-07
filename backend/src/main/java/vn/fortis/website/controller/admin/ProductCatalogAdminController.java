package vn.fortis.website.controller.admin;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import vn.fortis.website.dto.catalog.AdminCatalogResponse;
import vn.fortis.website.dto.catalog.AdminCategoryRequest;
import vn.fortis.website.dto.catalog.AdminProductUpsertRequest;
import vn.fortis.website.service.catalog.ProductCatalogService;

@Validated
@RestController
@RequestMapping("/api/admin/catalog")
public class ProductCatalogAdminController {

	private final ProductCatalogService productCatalogService;

	public ProductCatalogAdminController(ProductCatalogService productCatalogService) {
		this.productCatalogService = productCatalogService;
	}

	@GetMapping
	public AdminCatalogResponse getAdminCatalog() {
		return productCatalogService.getAdminCatalog();
	}

	@PostMapping("/categories")
	@ResponseStatus(HttpStatus.CREATED)
	public AdminCatalogResponse.CategoryAdminItem createCategory(@Valid @RequestBody AdminCategoryRequest request) {
		return productCatalogService.createCategory(request);
	}

	@PutMapping("/categories/{categoryId}")
	public AdminCatalogResponse.CategoryAdminItem updateCategory(
			@PathVariable String categoryId,
			@Valid @RequestBody AdminCategoryRequest request
	) {
		return productCatalogService.updateCategory(categoryId, request);
	}

	@DeleteMapping("/categories/{categoryId}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void deleteCategory(@PathVariable String categoryId) {
		productCatalogService.deleteCategory(categoryId);
	}

	@PostMapping(path = "/products", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	@ResponseStatus(HttpStatus.CREATED)
	public AdminCatalogResponse.ProductAdminItem createProduct(
			@Valid @RequestPart("payload") AdminProductUpsertRequest request,
			@RequestPart(value = "image", required = false) MultipartFile image,
			@RequestPart(value = "specificationFile", required = false) MultipartFile specificationFile
	) {
		return productCatalogService.createProduct(request, image, specificationFile);
	}

	@PutMapping(path = "/products/{productId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public AdminCatalogResponse.ProductAdminItem updateProduct(
			@PathVariable String productId,
			@Valid @RequestPart("payload") AdminProductUpsertRequest request,
			@RequestPart(value = "image", required = false) MultipartFile image,
			@RequestPart(value = "specificationFile", required = false) MultipartFile specificationFile
	) {
		return productCatalogService.updateProduct(productId, request, image, specificationFile);
	}

	@DeleteMapping("/products/{productId}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void deleteProduct(@PathVariable String productId) {
		productCatalogService.deleteProduct(productId);
	}
}
