package vn.fortis.website.controller.admin;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import vn.fortis.website.dto.content.AdminBannerUpdateRequest;
import vn.fortis.website.dto.content.AdminContentProfileUpdateRequest;
import vn.fortis.website.dto.content.AdminContentResponse;
import vn.fortis.website.service.content.ContentManagementService;

@RestController
@RequestMapping("/api/admin/content")
public class ContentAdminController {

	private final ContentManagementService contentManagementService;

	public ContentAdminController(ContentManagementService contentManagementService) {
		this.contentManagementService = contentManagementService;
	}

	@GetMapping
	public AdminContentResponse getContent() {
		return contentManagementService.getAdminContent();
	}

	@PutMapping("/profile")
	public AdminContentResponse updateProfile(@Valid @RequestBody AdminContentProfileUpdateRequest request) {
		return contentManagementService.updateProfile(request);
	}

	@PutMapping(path = "/banners/{slot}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public AdminContentResponse.BannerItem updateBanner(
			@PathVariable int slot,
			@Valid @RequestPart("payload") AdminBannerUpdateRequest request,
			@RequestPart(value = "image", required = false) MultipartFile image
	) {
		return contentManagementService.updateBanner(slot, request, image);
	}
}
