package vn.fortis.website.controller.publicapi;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import vn.fortis.website.dto.contact.ContactSubmissionRequest;
import vn.fortis.website.dto.contact.ContactSubmissionResponse;
import vn.fortis.website.service.contact.ContactManagementService;

@RestController
@RequestMapping("/api/public/contacts")
public class ContactController {

	private final ContactManagementService contactManagementService;

	public ContactController(ContactManagementService contactManagementService) {
		this.contactManagementService = contactManagementService;
	}

	@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	@ResponseStatus(HttpStatus.CREATED)
	public ContactSubmissionResponse submit(
			@Valid @RequestPart("payload") ContactSubmissionRequest request,
			@RequestPart(value = "attachment", required = false) MultipartFile attachment
	) {
		return contactManagementService.submitContact(request, attachment);
	}
}
