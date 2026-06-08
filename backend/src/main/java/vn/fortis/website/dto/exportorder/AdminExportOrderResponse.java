package vn.fortis.website.dto.exportorder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record AdminExportOrderResponse(
		List<OrderItem> orders,
		List<OrderStatusStep> statusSteps
) {

	public record OrderItem(
			String id,
			String orderCode,
			String customerId,
			String customerName,
			String customerCompany,
			String product,
			String catalogProductId,
			String catalogProductName,
			BigDecimal quantity,
			String quantityUnit,
			BigDecimal packageWeightKg,
			BigDecimal packageQuantity,
			String paymentMethod,
			String shippingMethod,
			BigDecimal factoryUnitPrice,
			BigDecimal sellingUnitPrice,
			BigDecimal cargoInsurancePercent,
			BigDecimal shippingTotal,
			BigDecimal totalFactoryCost,
			BigDecimal baseRevenue,
			BigDecimal cargoInsuranceAmount,
			BigDecimal totalRevenue,
			BigDecimal totalCapital,
			BigDecimal totalProfit,
			String status,
			String notes,
			List<StatusHistoryItem> statusHistory,
			LocalDateTime createdAt,
			LocalDateTime updatedAt
	) {
	}

	public record StatusHistoryItem(
			String status,
			String note,
			LocalDateTime changedAt
	) {
	}

	public record OrderStatusStep(
			String value,
			String label
	) {
	}
}
