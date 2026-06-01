package vn.fortis.website.service.customer;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import vn.fortis.website.dto.customer.AdminCustomerResponse;
import vn.fortis.website.dto.customer.AdminCustomerUpsertRequest;
import vn.fortis.website.entity.CustomerContactChannelValue;
import vn.fortis.website.entity.CustomerLeadEntity;
import vn.fortis.website.repository.CustomerLeadRepository;

@Service
@Transactional
public class CustomerLeadService {

	private static final String DEFAULT_STATUS = "NOT_CONTACTED";

	private final CustomerLeadRepository customerLeadRepository;

	public CustomerLeadService(CustomerLeadRepository customerLeadRepository) {
		this.customerLeadRepository = customerLeadRepository;
	}

	@Transactional(readOnly = true)
	public synchronized AdminCustomerResponse getCustomers() {
		return new AdminCustomerResponse(
				customerLeadRepository.findAll().stream()
						.sorted(Comparator.comparing(CustomerLeadEntity::getCreatedAt).reversed())
						.map(this::mapCustomer)
						.toList()
		);
	}

	public synchronized AdminCustomerResponse.CustomerItem createCustomer(AdminCustomerUpsertRequest request) {
		CustomerLeadEntity customer = new CustomerLeadEntity();
		customer.setId(UUID.randomUUID().toString());
		applyCustomerValues(customer, request);
		return mapCustomer(customerLeadRepository.save(customer));
	}

	public synchronized AdminCustomerResponse.CustomerItem updateCustomer(String customerId, AdminCustomerUpsertRequest request) {
		CustomerLeadEntity customer = requireCustomer(customerId);
		applyCustomerValues(customer, request);
		return mapCustomer(customerLeadRepository.save(customer));
	}

	public synchronized void deleteCustomer(String customerId) {
		requireCustomer(customerId);
		customerLeadRepository.deleteById(customerId);
	}

	private CustomerLeadEntity requireCustomer(String customerId) {
		return customerLeadRepository.findById(customerId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer lead not found"));
	}

	private void applyCustomerValues(CustomerLeadEntity customer, AdminCustomerUpsertRequest request) {
		customer.setCustomerName(requiredText(request.customerName()));
		customer.setCountry(nullableText(request.country()));
		customer.setCompany(nullableText(request.company()));
		customer.setPositionTitle(nullableText(request.positionTitle()));
		customer.setPhoneNumbers(normalizeList(request.phoneNumbers()));
		customer.setEmail(nullableText(request.email()));
		customer.setContactApplications(List.of());
		customer.setWebsite(nullableText(request.website()));
		customer.setMainProduct(nullableText(request.mainProduct()));
		customer.setContactStatus(normalizeStatus(request.contactStatus()));
		customer.setHsCode(nullableText(request.hsCode()));
		customer.setPackingSpecification(nullableText(request.packingSpecification()));
		customer.setLabelingRequirement(nullableText(request.labelingRequirement()));
		customer.setIncoterms(nullableText(request.incoterms()));
		customer.setDestinationPort(nullableText(request.destinationPort()));
		customer.setPreferredShippingMethod(nullableText(request.preferredShippingMethod()));
		customer.setExpectedTransitTime(nullableText(request.expectedTransitTime()));
		customer.setPaymentMethod(nullableText(request.paymentMethod()));
		customer.setRequiredDocuments(nullableText(request.requiredDocuments()));
		customer.setNotes(nullableText(request.notes()));
	}

	private AdminCustomerResponse.CustomerItem mapCustomer(CustomerLeadEntity customer) {
		return new AdminCustomerResponse.CustomerItem(
				customer.getId(),
				customer.getCustomerName(),
				customer.getCountry(),
				customer.getCompany(),
				customer.getPositionTitle(),
				List.copyOf(customer.getPhoneNumbers()),
				customer.getEmail(),
				customer.getContactApplications().stream().map(this::mapContactApplication).toList(),
				customer.getWebsite(),
				customer.getMainProduct(),
				customer.getContactStatus(),
				customer.getHsCode(),
				customer.getPackingSpecification(),
				customer.getLabelingRequirement(),
				customer.getIncoterms(),
				customer.getDestinationPort(),
				customer.getPreferredShippingMethod(),
				customer.getExpectedTransitTime(),
				customer.getPaymentMethod(),
				customer.getRequiredDocuments(),
				customer.getNotes(),
				customer.getCreatedAt(),
				customer.getUpdatedAt()
		);
	}

	private AdminCustomerResponse.ContactApplicationItem mapContactApplication(CustomerContactChannelValue channel) {
		return new AdminCustomerResponse.ContactApplicationItem(channel.getPhoneNumber(), channel.getApplication());
	}

	private List<CustomerContactChannelValue> normalizeContactApplications(
			List<AdminCustomerUpsertRequest.ContactApplicationItem> items
	) {
		if (items == null) {
			return List.of();
		}
		return items.stream()
				.filter(item -> item != null && item.phoneNumber() != null && item.application() != null)
				.map(item -> {
					CustomerContactChannelValue channel = new CustomerContactChannelValue();
					channel.setPhoneNumber(requiredText(item.phoneNumber()));
					channel.setApplication(requiredText(item.application()).toUpperCase());
					return channel;
				})
				.filter(channel -> !channel.getPhoneNumber().isBlank() && !channel.getApplication().isBlank())
				.toList();
	}

	private List<String> normalizeList(List<String> values) {
		if (values == null) {
			return List.of();
		}
		return values.stream()
				.filter(value -> value != null && !value.isBlank())
				.map(String::trim)
				.distinct()
				.toList();
	}

	private String normalizeStatus(String status) {
		String normalized = nullableText(status);
		return normalized == null ? DEFAULT_STATUS : normalized.toUpperCase();
	}

	private String nullableText(String value) {
		if (value == null || value.isBlank()) {
			return null;
		}
		return value.trim();
	}

	private String requiredText(String value) {
		return value == null ? "" : value.trim();
	}
}
