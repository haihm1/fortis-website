package vn.fortis.website.controller.admin;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import vn.fortis.website.dto.contact.AdminContactResponse;
import vn.fortis.website.dto.contact.ContactStatusUpdateRequest;
import vn.fortis.website.service.contact.ContactManagementService;

@RestController
@RequestMapping("/api/admin/contacts")
public class ContactAdminController {

	private final ContactManagementService contactManagementService;

	public ContactAdminController(ContactManagementService contactManagementService) {
		this.contactManagementService = contactManagementService;
	}

	@GetMapping
	public AdminContactResponse getContacts() {
		return contactManagementService.getAllContacts();
	}

	@PutMapping("/{contactId}/status")
	public AdminContactResponse.ContactItem updateStatus(
			@PathVariable String contactId,
			@Valid @RequestBody ContactStatusUpdateRequest request
	) {
		return contactManagementService.updateStatus(contactId, request);
	}
}
