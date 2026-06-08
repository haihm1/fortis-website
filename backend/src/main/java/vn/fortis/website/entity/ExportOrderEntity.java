package vn.fortis.website.entity;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;

@Entity
@Table(name = "export_orders")
public class ExportOrderEntity extends BaseAuditEntity {

	@Id
	private String id;

	@Column(name = "order_code", nullable = false, unique = true, length = 80)
	private String orderCode;

	@Column(name = "customer_id", length = 80)
	private String customerId;

	@Column(name = "customer_name", nullable = false, length = 180)
	private String customerName;

	@Column(name = "customer_company", length = 180)
	private String customerCompany;

	@Column(nullable = false, length = 180)
	private String product;

	@Column(name = "catalog_product_id", length = 80)
	private String catalogProductId;

	@Column(name = "catalog_product_name", length = 180)
	private String catalogProductName;

	@Column(nullable = false, precision = 19, scale = 3)
	private BigDecimal quantity;

	@Column(name = "quantity_unit", nullable = false, length = 40)
	private String quantityUnit;

	@Column(name = "package_weight_kg", precision = 19, scale = 3)
	private BigDecimal packageWeightKg;

	@Column(name = "package_quantity", precision = 19, scale = 3)
	private BigDecimal packageQuantity;

	@Column(name = "payment_method", length = 150)
	private String paymentMethod;

	@Column(name = "shipping_method", length = 150)
	private String shippingMethod;

	@Column(name = "factory_unit_price", nullable = false, precision = 19, scale = 2)
	private BigDecimal factoryUnitPrice;

	@Column(name = "selling_unit_price", nullable = false, precision = 19, scale = 2)
	private BigDecimal sellingUnitPrice;

	@Column(name = "cargo_insurance_percent", precision = 8, scale = 3)
	private BigDecimal cargoInsurancePercent;

	@Column(name = "shipping_total", nullable = false, precision = 19, scale = 2)
	private BigDecimal shippingTotal;

	@Column(nullable = false, length = 50)
	private String status;

	@Column(columnDefinition = "TEXT")
	private String notes;

	@ElementCollection(fetch = FetchType.EAGER)
	@CollectionTable(name = "export_order_status_history", joinColumns = @JoinColumn(name = "order_id"))
	private List<ExportOrderStatusHistoryValue> statusHistory = new ArrayList<>();

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getOrderCode() {
		return orderCode;
	}

	public void setOrderCode(String orderCode) {
		this.orderCode = orderCode;
	}

	public String getCustomerId() {
		return customerId;
	}

	public void setCustomerId(String customerId) {
		this.customerId = customerId;
	}

	public String getCustomerName() {
		return customerName;
	}

	public void setCustomerName(String customerName) {
		this.customerName = customerName;
	}

	public String getCustomerCompany() {
		return customerCompany;
	}

	public void setCustomerCompany(String customerCompany) {
		this.customerCompany = customerCompany;
	}

	public String getProduct() {
		return product;
	}

	public void setProduct(String product) {
		this.product = product;
	}

	public String getCatalogProductId() {
		return catalogProductId;
	}

	public void setCatalogProductId(String catalogProductId) {
		this.catalogProductId = catalogProductId;
	}

	public String getCatalogProductName() {
		return catalogProductName;
	}

	public void setCatalogProductName(String catalogProductName) {
		this.catalogProductName = catalogProductName;
	}

	public BigDecimal getQuantity() {
		return quantity;
	}

	public void setQuantity(BigDecimal quantity) {
		this.quantity = quantity;
	}

	public String getQuantityUnit() {
		return quantityUnit;
	}

	public void setQuantityUnit(String quantityUnit) {
		this.quantityUnit = quantityUnit;
	}

	public BigDecimal getPackageWeightKg() {
		return packageWeightKg;
	}

	public void setPackageWeightKg(BigDecimal packageWeightKg) {
		this.packageWeightKg = packageWeightKg;
	}

	public BigDecimal getPackageQuantity() {
		return packageQuantity;
	}

	public void setPackageQuantity(BigDecimal packageQuantity) {
		this.packageQuantity = packageQuantity;
	}

	public String getPaymentMethod() {
		return paymentMethod;
	}

	public void setPaymentMethod(String paymentMethod) {
		this.paymentMethod = paymentMethod;
	}

	public String getShippingMethod() {
		return shippingMethod;
	}

	public void setShippingMethod(String shippingMethod) {
		this.shippingMethod = shippingMethod;
	}

	public BigDecimal getFactoryUnitPrice() {
		return factoryUnitPrice;
	}

	public void setFactoryUnitPrice(BigDecimal factoryUnitPrice) {
		this.factoryUnitPrice = factoryUnitPrice;
	}

	public BigDecimal getSellingUnitPrice() {
		return sellingUnitPrice;
	}

	public void setSellingUnitPrice(BigDecimal sellingUnitPrice) {
		this.sellingUnitPrice = sellingUnitPrice;
	}

	public BigDecimal getCargoInsurancePercent() {
		return cargoInsurancePercent;
	}

	public void setCargoInsurancePercent(BigDecimal cargoInsurancePercent) {
		this.cargoInsurancePercent = cargoInsurancePercent;
	}

	public BigDecimal getShippingTotal() {
		return shippingTotal;
	}

	public void setShippingTotal(BigDecimal shippingTotal) {
		this.shippingTotal = shippingTotal;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public String getNotes() {
		return notes;
	}

	public void setNotes(String notes) {
		this.notes = notes;
	}

	public List<ExportOrderStatusHistoryValue> getStatusHistory() {
		return statusHistory;
	}

	public void setStatusHistory(List<ExportOrderStatusHistoryValue> statusHistory) {
		this.statusHistory = new ArrayList<>(statusHistory);
	}
}
