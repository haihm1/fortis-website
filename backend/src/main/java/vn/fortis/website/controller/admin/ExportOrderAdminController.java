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
import vn.fortis.website.dto.exportorder.AdminExportOrderResponse;
import vn.fortis.website.dto.exportorder.AdminExportOrderStatusUpdateRequest;
import vn.fortis.website.dto.exportorder.AdminExportOrderUpsertRequest;
import vn.fortis.website.service.exportorder.ExportOrderService;

@RestController
@RequestMapping("/api/admin/export-orders")
public class ExportOrderAdminController {

	private final ExportOrderService exportOrderService;

	public ExportOrderAdminController(ExportOrderService exportOrderService) {
		this.exportOrderService = exportOrderService;
	}

	@GetMapping
	public AdminExportOrderResponse getOrders() {
		return exportOrderService.getOrders();
	}

	@PostMapping
	public AdminExportOrderResponse.OrderItem createOrder(
			@Valid @RequestBody AdminExportOrderUpsertRequest request
	) {
		return exportOrderService.createOrder(request);
	}

	@PutMapping("/{orderId}")
	public AdminExportOrderResponse.OrderItem updateOrder(
			@PathVariable String orderId,
			@Valid @RequestBody AdminExportOrderUpsertRequest request
	) {
		return exportOrderService.updateOrder(orderId, request);
	}

	@PutMapping("/{orderId}/status")
	public AdminExportOrderResponse.OrderItem updateStatus(
			@PathVariable String orderId,
			@Valid @RequestBody AdminExportOrderStatusUpdateRequest request
	) {
		return exportOrderService.updateStatus(orderId, request);
	}

	@DeleteMapping("/{orderId}")
	public ResponseEntity<Void> deleteOrder(@PathVariable String orderId) {
		exportOrderService.deleteOrder(orderId);
		return ResponseEntity.noContent().build();
	}
}
