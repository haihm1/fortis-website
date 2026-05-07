package vn.fortis.website.service.contact;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import vn.fortis.website.dto.contact.AdminContactResponse;
import vn.fortis.website.dto.contact.ContactStatusUpdateRequest;
import vn.fortis.website.dto.contact.ContactSubmissionRequest;
import vn.fortis.website.dto.contact.ContactSubmissionResponse;
import vn.fortis.website.entity.ContactRequestEntity;
import vn.fortis.website.repository.ContactRequestRepository;
import vn.fortis.website.service.catalog.FileStorageService;

@Service
public class ContactManagementService {

	private final ContactRequestRepository contactRequestRepository;
	private final ContactNotificationService contactNotificationService;
	private final FileStorageService fileStorageService;

	public ContactManagementService(
			ContactRequestRepository contactRequestRepository,
			ContactNotificationService contactNotificationService,
			FileStorageService fileStorageService
	) {
		this.contactRequestRepository = contactRequestRepository;
		this.contactNotificationService = contactNotificationService;
		this.fileStorageService = fileStorageService;
	}

	public synchronized ContactSubmissionResponse submitContact(
			ContactSubmissionRequest request,
			MultipartFile attachment
	) {
		ContactRequestEntity contactRecord = new ContactRequestEntity();
		contactRecord.setId(UUID.randomUUID().toString());
		contactRecord.setFullName(request.fullName());
		contactRecord.setCompanyName(request.companyName());
		contactRecord.setEmail(request.email());
		contactRecord.setPhoneNumber(request.phoneNumber());
		contactRecord.setProductInterest(request.productInterest());
		contactRecord.setRequestedQuantity(request.requestedQuantity());
		contactRecord.setTargetMarket(request.targetMarket());
		contactRecord.setSpecificationDetails(request.specificationDetails());
		contactRecord.setAttachmentUrl(fileStorageService.store(attachment, "contacts/attachments"));
		contactRecord.setMessage(request.message());
		contactRecord.setStatus("NEW");
		contactRecord = contactRequestRepository.save(contactRecord);

		contactNotificationService.notifyNewContact(
				new ContactNotificationService.ContactMessage(
						contactRecord.getFullName(),
						contactRecord.getCompanyName(),
						contactRecord.getEmail(),
						contactRecord.getPhoneNumber(),
						contactRecord.getProductInterest(),
						contactRecord.getRequestedQuantity(),
						contactRecord.getTargetMarket(),
						contactRecord.getSpecificationDetails(),
						contactRecord.getAttachmentUrl(),
						contactRecord.getMessage()
				)
		);

		return new ContactSubmissionResponse(
				contactRecord.getId(),
				contactRecord.getStatus(),
				"Your request has been received successfully."
		);
	}

	public synchronized AdminContactResponse getAllContacts() {
		List<AdminContactResponse.ContactItem> items = contactRequestRepository.findAll().stream()
				.map(this::mapContact)
				.toList();
		return new AdminContactResponse(items);
	}

	public synchronized AdminContactResponse.ContactItem updateStatus(
			String contactId,
			ContactStatusUpdateRequest request
	) {
		ContactRequestEntity existingContact = requireContact(contactId);
		existingContact.setStatus(request.status().trim().toUpperCase());
		return mapContact(contactRequestRepository.save(existingContact));
	}

	private ContactRequestEntity requireContact(String contactId) {
		return contactRequestRepository.findById(contactId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contact not found"));
	}

	private AdminContactResponse.ContactItem mapContact(ContactRequestEntity contact) {
		return new AdminContactResponse.ContactItem(
				contact.getId(),
				contact.getFullName(),
				contact.getCompanyName(),
				contact.getEmail(),
				contact.getPhoneNumber(),
				contact.getProductInterest(),
				contact.getRequestedQuantity(),
				contact.getTargetMarket(),
				contact.getSpecificationDetails(),
				contact.getAttachmentUrl(),
				contact.getMessage(),
				contact.getStatus(),
				contact.getCreatedAt(),
				contact.getUpdatedAt()
		);
	}
}
