package vn.fortis.website.controller.admin;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import vn.fortis.website.dto.customer.AdminCustomerResponse;
import vn.fortis.website.dto.customer.AdminCustomerUpsertRequest;
import vn.fortis.website.service.customer.CustomerLeadService;

@RestController
@RequestMapping("/api/admin/customers")
public class CustomerLeadAdminController {

	private final CustomerLeadService customerLeadService;

	public CustomerLeadAdminController(CustomerLeadService customerLeadService) {
		this.customerLeadService = customerLeadService;
	}

	@GetMapping
	public AdminCustomerResponse getCustomers() {
		return customerLeadService.getCustomers();
	}

	@PostMapping
	public AdminCustomerResponse.CustomerItem createCustomer(
			@Valid @RequestBody AdminCustomerUpsertRequest request
	) {
		return customerLeadService.createCustomer(request);
	}

	@PutMapping("/{customerId}")
	public AdminCustomerResponse.CustomerItem updateCustomer(
			@PathVariable String customerId,
			@Valid @RequestBody AdminCustomerUpsertRequest request
	) {
		return customerLeadService.updateCustomer(customerId, request);
	}

	@DeleteMapping("/{customerId}")
	public ResponseEntity<Void> deleteCustomer(@PathVariable String customerId) {
		customerLeadService.deleteCustomer(customerId);
		return ResponseEntity.noContent().build();
	}
}
