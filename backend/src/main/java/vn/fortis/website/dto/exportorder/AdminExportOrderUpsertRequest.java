package vn.fortis.website.dto.exportorder;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AdminExportOrderUpsertRequest(
		String customerId,
		@NotBlank(message = "Customer name is required")
		String customerName,
		String customerCompany,
		@NotBlank(message = "Product is required")
		String product,
		String catalogProductId,
		String catalogProductName,
		@NotNull(message = "Quantity is required")
		@DecimalMin(value = "0.001", message = "Quantity must be greater than zero")
		BigDecimal quantity,
		String quantityUnit,
		@DecimalMin(value = "0", message = "Package weight cannot be negative")
		BigDecimal packageWeightKg,
		@DecimalMin(value = "0", message = "Package quantity cannot be negative")
		BigDecimal packageQuantity,
		String paymentMethod,
		String shippingMethod,
		@NotNull(message = "Factory unit price is required")
		@DecimalMin(value = "0", message = "Factory unit price cannot be negative")
		BigDecimal factoryUnitPrice,
		@NotNull(message = "Selling unit price is required")
		@DecimalMin(value = "0", message = "Selling unit price cannot be negative")
		BigDecimal sellingUnitPrice,
		@DecimalMin(value = "0", message = "Cargo insurance percent cannot be negative")
		BigDecimal cargoInsurancePercent,
		@NotNull(message = "Shipping total is required")
		@DecimalMin(value = "0", message = "Shipping total cannot be negative")
		BigDecimal shippingTotal,
		String status,
		String statusNote,
		String notes
) {
}
