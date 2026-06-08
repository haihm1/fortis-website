package vn.fortis.website.service.exportorder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import vn.fortis.website.dto.exportorder.AdminExportOrderResponse;
import vn.fortis.website.dto.exportorder.AdminExportOrderStatusUpdateRequest;
import vn.fortis.website.dto.exportorder.AdminExportOrderUpsertRequest;
import vn.fortis.website.entity.ExportOrderEntity;
import vn.fortis.website.entity.ExportOrderStatusHistoryValue;
import vn.fortis.website.repository.ExportOrderRepository;

@Service
@Transactional
public class ExportOrderService {

	public static final List<AdminExportOrderResponse.OrderStatusStep> STATUS_STEPS = List.of(
			new AdminExportOrderResponse.OrderStatusStep("NEGOTIATING", "Đang làm việc với khách"),
			new AdminExportOrderResponse.OrderStatusStep("WORKING_WITH_FACTORY", "Đang làm việc với xưởng"),
			new AdminExportOrderResponse.OrderStatusStep("PACKING", "Đang đóng gói"),
			new AdminExportOrderResponse.OrderStatusStep("CUSTOMS", "Đang làm chứng từ / hải quan"),
			new AdminExportOrderResponse.OrderStatusStep("SHIPPING", "Đang vận chuyển"),
			new AdminExportOrderResponse.OrderStatusStep("DELIVERED", "Đã giao hàng"),
			new AdminExportOrderResponse.OrderStatusStep("CLOSED", "Đã hoàn tất")
	);
	private static final Set<String> ALLOWED_STATUSES = STATUS_STEPS.stream()
			.map(AdminExportOrderResponse.OrderStatusStep::value)
			.collect(java.util.stream.Collectors.toUnmodifiableSet());
	private static final String DEFAULT_STATUS = "NEGOTIATING";
	private static final String DEFAULT_QUANTITY_UNIT = "KG";
	private static final Set<String> PACKAGE_UNITS = Set.of("THUNG", "HOP", "BAO", "KIEN");

	private final ExportOrderRepository exportOrderRepository;

	public ExportOrderService(ExportOrderRepository exportOrderRepository) {
		this.exportOrderRepository = exportOrderRepository;
	}

	@Transactional(readOnly = true)
	public synchronized AdminExportOrderResponse getOrders() {
		return new AdminExportOrderResponse(
				exportOrderRepository.findAll().stream()
						.sorted(Comparator.comparing(ExportOrderEntity::getCreatedAt).reversed())
						.map(this::mapOrder)
						.toList(),
				STATUS_STEPS
		);
	}

	public synchronized AdminExportOrderResponse.OrderItem createOrder(AdminExportOrderUpsertRequest request) {
		ExportOrderEntity order = new ExportOrderEntity();
		order.setId(UUID.randomUUID().toString());
		order.setOrderCode(generateOrderCode());
		applyOrderValues(order, request);
		appendStatusHistory(order, order.getStatus(), nullableText(request.statusNote()));
		return mapOrder(exportOrderRepository.save(order));
	}

	public synchronized AdminExportOrderResponse.OrderItem updateOrder(String orderId, AdminExportOrderUpsertRequest request) {
		ExportOrderEntity order = requireOrder(orderId);
		String currentStatus = order.getStatus();
		applyOrderValues(order, request);
		if (!order.getStatus().equals(currentStatus)) {
			appendStatusHistory(order, order.getStatus(), nullableText(request.statusNote()));
		}
		return mapOrder(exportOrderRepository.save(order));
	}

	public synchronized AdminExportOrderResponse.OrderItem updateStatus(
			String orderId,
			AdminExportOrderStatusUpdateRequest request
	) {
		ExportOrderEntity order = requireOrder(orderId);
		String status = normalizeStatus(request.status());
		order.setStatus(status);
		appendStatusHistory(order, status, nullableText(request.note()));
		return mapOrder(exportOrderRepository.save(order));
	}

	public synchronized void deleteOrder(String orderId) {
		requireOrder(orderId);
		exportOrderRepository.deleteById(orderId);
	}

	private void applyOrderValues(ExportOrderEntity order, AdminExportOrderUpsertRequest request) {
		order.setCustomerId(nullableText(request.customerId()));
		order.setCustomerName(requiredText(request.customerName()));
		order.setCustomerCompany(nullableText(request.customerCompany()));
		order.setProduct(requiredText(request.product()));
		order.setCatalogProductId(nullableText(request.catalogProductId()));
		order.setCatalogProductName(nullableText(request.catalogProductName()));
		String quantityUnit = normalizeQuantityUnit(request.quantityUnit());
		order.setQuantityUnit(quantityUnit);
		order.setPackageWeightKg(PACKAGE_UNITS.contains(quantityUnit) ? nonNullMoney(request.packageWeightKg()) : null);
		order.setPackageQuantity(PACKAGE_UNITS.contains(quantityUnit) ? nonNullMoney(request.packageQuantity()) : null);
		order.setQuantity(resolveTotalWeight(request, quantityUnit));
		order.setPaymentMethod(nullableText(request.paymentMethod()));
		order.setShippingMethod(nullableText(request.shippingMethod()));
		order.setFactoryUnitPrice(nonNullMoney(request.factoryUnitPrice()));
		order.setSellingUnitPrice(nonNullMoney(request.sellingUnitPrice()));
		order.setCargoInsurancePercent(nonNullMoney(request.cargoInsurancePercent()));
		order.setShippingTotal(nonNullMoney(request.shippingTotal()));
		order.setStatus(normalizeStatus(request.status()));
		order.setNotes(nullableText(request.notes()));
	}

	private ExportOrderEntity requireOrder(String orderId) {
		return exportOrderRepository.findById(orderId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Export order not found"));
	}

	private AdminExportOrderResponse.OrderItem mapOrder(ExportOrderEntity order) {
		BigDecimal totalFactoryCost = order.getFactoryUnitPrice().multiply(order.getQuantity());
		BigDecimal baseRevenue = order.getSellingUnitPrice().multiply(order.getQuantity());
		BigDecimal cargoInsurancePercent = nonNullMoney(order.getCargoInsurancePercent());
		BigDecimal cargoInsuranceAmount = baseRevenue
				.multiply(cargoInsurancePercent)
				.divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
		BigDecimal totalRevenue = baseRevenue.add(cargoInsuranceAmount);
		BigDecimal totalCapital = totalFactoryCost.add(order.getShippingTotal());
		BigDecimal totalProfit = totalRevenue.subtract(totalCapital);

		return new AdminExportOrderResponse.OrderItem(
				order.getId(),
				order.getOrderCode(),
				order.getCustomerId(),
				order.getCustomerName(),
				order.getCustomerCompany(),
				order.getProduct(),
				order.getCatalogProductId(),
				order.getCatalogProductName(),
				order.getQuantity(),
				order.getQuantityUnit(),
				order.getPackageWeightKg(),
				order.getPackageQuantity(),
				order.getPaymentMethod(),
				order.getShippingMethod(),
				order.getFactoryUnitPrice(),
				order.getSellingUnitPrice(),
				cargoInsurancePercent,
				order.getShippingTotal(),
				totalFactoryCost,
				baseRevenue,
				cargoInsuranceAmount,
				totalRevenue,
				totalCapital,
				totalProfit,
				order.getStatus(),
				order.getNotes(),
				order.getStatusHistory().stream()
						.sorted(Comparator.comparing(ExportOrderStatusHistoryValue::getChangedAt))
						.map(this::mapHistory)
						.toList(),
				order.getCreatedAt(),
				order.getUpdatedAt()
		);
	}

	private AdminExportOrderResponse.StatusHistoryItem mapHistory(ExportOrderStatusHistoryValue history) {
		return new AdminExportOrderResponse.StatusHistoryItem(
				history.getStatus(),
				history.getNote(),
				history.getChangedAt()
		);
	}

	private void appendStatusHistory(ExportOrderEntity order, String status, String note) {
		ExportOrderStatusHistoryValue history = new ExportOrderStatusHistoryValue();
		history.setStatus(status);
		history.setNote(note);
		history.setChangedAt(LocalDateTime.now());
		List<ExportOrderStatusHistoryValue> next = new java.util.ArrayList<>(order.getStatusHistory());
		next.add(history);
		order.setStatusHistory(next);
	}

	private String normalizeStatus(String status) {
		String normalized = nullableText(status);
		if (normalized == null) {
			return DEFAULT_STATUS;
		}
		normalized = normalized.toUpperCase();
		if (!ALLOWED_STATUSES.contains(normalized)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported order status: " + status);
		}
		return normalized;
	}

	private String generateOrderCode() {
		return "EX-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss")) + "-"
				+ UUID.randomUUID().toString().substring(0, 6).toUpperCase();
	}

	private BigDecimal nonNullMoney(BigDecimal value) {
		return value == null ? BigDecimal.ZERO : value;
	}

	private BigDecimal resolveTotalWeight(AdminExportOrderUpsertRequest request, String quantityUnit) {
		if (PACKAGE_UNITS.contains(quantityUnit)) {
			BigDecimal packageWeight = nonNullMoney(request.packageWeightKg());
			BigDecimal packageQuantity = nonNullMoney(request.packageQuantity());
			BigDecimal totalWeight = packageWeight.multiply(packageQuantity);
			if (totalWeight.compareTo(BigDecimal.ZERO) <= 0) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Package weight and package quantity must create a total weight greater than zero");
			}
			return totalWeight;
		}
		return nonNullMoney(request.quantity());
	}

	private String normalizeQuantityUnit(String quantityUnit) {
		String normalized = nullableText(quantityUnit);
		return normalized == null ? DEFAULT_QUANTITY_UNIT : normalized.toUpperCase();
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
