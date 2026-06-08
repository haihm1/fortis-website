import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { IconClose, IconEdit, IconPlus, IconSearch, IconTrash } from '../../admin/AdminIcons'
import {
  createAdminExportOrder,
  deleteAdminExportOrder,
  getAdminCatalog,
  getAdminCustomers,
  getAdminExportOrders,
  updateAdminExportOrder,
  updateAdminExportOrderStatus,
} from '../../services/admin/adminApi'

const FALLBACK_STATUS_STEPS = [
  { value: 'NEGOTIATING', label: 'Đang làm việc với khách' },
  { value: 'WORKING_WITH_FACTORY', label: 'Đang làm việc với xưởng' },
  { value: 'PACKING', label: 'Đang đóng gói' },
  { value: 'CUSTOMS', label: 'Đang làm chứng từ / hải quan' },
  { value: 'SHIPPING', label: 'Đang vận chuyển' },
  { value: 'DELIVERED', label: 'Đã giao hàng' },
  { value: 'CLOSED', label: 'Đã hoàn tất' },
]

const QUANTITY_UNITS = [
  { value: 'KG', label: 'Kg' },
  { value: 'THUNG', label: 'Thùng' },
  { value: 'HOP', label: 'Hộp' },
  { value: 'BAO', label: 'Bao' },
  { value: 'KIEN', label: 'Kiện' },
]
const PACKAGE_UNITS = new Set(['THUNG', 'HOP', 'BAO', 'KIEN'])
const PRODUCT_TYPES = ['Nông sản', 'Lâm sản', 'Hải sản']
const PAYMENT_METHODS = ['T/T', 'L/C', 'D/P', 'D/A', 'O/A', 'Barter']
const SHIPPING_METHODS = [
  'Ocean Freight',
  'Air Freight',
  'Trucking',
  'Rail Freight',
  'Pipeline Transport',
  'Multimodal Transport',
]

const EMPTY_FORM = {
  customerId: '',
  customerName: '',
  customerCompany: '',
  product: '',
  catalogProductId: '',
  catalogProductName: '',
  quantity: '',
  quantityUnit: 'KG',
  packageWeightKg: '',
  packageQuantity: '',
  paymentMethod: '',
  shippingMethod: '',
  factoryUnitPrice: '',
  sellingUnitPrice: '',
  cargoInsurancePercent: '',
  shippingTotal: '',
  status: 'NEGOTIATING',
  statusNote: '',
  notes: '',
}

function money(value) {
  const number = Number(value ?? 0)
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(Number.isFinite(number) ? number : 0)
}

function formatDateTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })
}

function statusLabel(status, steps) {
  return steps.find((step) => step.value === status)?.label ?? status
}

function normalizeForm(order) {
  if (!order) return EMPTY_FORM
  const legacyCatalogProductId =
    order.catalogProductId || !order.catalogProductName ? '' : `legacy:${order.catalogProductName}`
  return {
    customerId: order.customerId ?? '',
    customerName: order.customerName ?? '',
    customerCompany: order.customerCompany ?? '',
    product: order.product ?? '',
    catalogProductId: legacyCatalogProductId,
    catalogProductName: order.catalogProductName ?? '',
    quantity: String(order.quantity ?? ''),
    quantityUnit: order.quantityUnit ?? 'KG',
    packageWeightKg: String(order.packageWeightKg ?? ''),
    packageQuantity: String(order.packageQuantity ?? ''),
    paymentMethod: order.paymentMethod ?? '',
    shippingMethod: order.shippingMethod ?? '',
    factoryUnitPrice: String(order.factoryUnitPrice ?? ''),
    sellingUnitPrice: String(order.sellingUnitPrice ?? ''),
    cargoInsurancePercent: String(order.cargoInsurancePercent ?? ''),
    shippingTotal: String(order.shippingTotal ?? ''),
    status: order.status ?? 'NEGOTIATING',
    statusNote: '',
    notes: order.notes ?? '',
  }
}

function cleanPayload(form) {
  return {
    ...form,
    customerName: form.customerName.trim(),
    product: form.product.trim(),
    catalogProductId: form.catalogProductId.startsWith('legacy:') ? '' : form.catalogProductId,
    catalogProductName: form.catalogProductName.trim(),
    quantity: calculateTotalWeight(form),
    quantityUnit: form.quantityUnit || 'KG',
    packageWeightKg: Number(form.packageWeightKg || 0),
    packageQuantity: Number(form.packageQuantity || 0),
    factoryUnitPrice: Number(form.factoryUnitPrice || 0),
    sellingUnitPrice: Number(form.sellingUnitPrice || 0),
    cargoInsurancePercent: Number(form.cargoInsurancePercent || 0),
    shippingTotal: Number(form.shippingTotal || 0),
  }
}

function calculatePreview(form) {
  const quantity = calculateTotalWeight(form)
  const factoryUnitPrice = Number(form.factoryUnitPrice || 0)
  const sellingUnitPrice = Number(form.sellingUnitPrice || 0)
  const cargoInsurancePercent = Number(form.cargoInsurancePercent || 0)
  const shippingTotal = Number(form.shippingTotal || 0)
  const totalFactoryCost = quantity * factoryUnitPrice
  const baseRevenue = quantity * sellingUnitPrice
  const cargoInsuranceAmount = baseRevenue * cargoInsurancePercent / 100
  const totalRevenue = baseRevenue + cargoInsuranceAmount
  const totalCapital = totalFactoryCost + shippingTotal
  return {
    totalFactoryCost,
    baseRevenue,
    cargoInsuranceAmount,
    totalRevenue,
    totalCapital,
    totalProfit: totalRevenue - totalCapital,
  }
}

function calculateTotalWeight(form) {
  if (PACKAGE_UNITS.has(form.quantityUnit)) {
    return Number(form.packageWeightKg || 0) * Number(form.packageQuantity || 0)
  }
  return Number(form.quantity || 0)
}

function quantityDescription(order) {
  if (!order) return '—'
  if (PACKAGE_UNITS.has(order.quantityUnit)) {
    const unitLabel = QUANTITY_UNITS.find((unit) => unit.value === order.quantityUnit)?.label ?? order.quantityUnit
    return `${money(order.packageQuantity)} ${unitLabel.toLowerCase()} x ${money(order.packageWeightKg)} kg = ${money(order.quantity)} kg`
  }
  return `${money(order.quantity)} kg`
}

export function ExportOrderManagementPage() {
  const { adminAuth } = useOutletContext()
  const [orders, setOrders] = useState([])
  const [customers, setCustomers] = useState([])
  const [catalogProducts, setCatalogProducts] = useState([])
  const [statusSteps, setStatusSteps] = useState(FALLBACK_STATUS_STEPS)
  const [selectedId, setSelectedId] = useState(null)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [statusNote, setStatusNote] = useState('')

  useEffect(() => {
    let mounted = true
    Promise.all([
      getAdminExportOrders(adminAuth.token),
      getAdminCustomers(adminAuth.token).catch(() => ({ customers: [] })),
      getAdminCatalog(adminAuth.token).catch(() => ({ products: [] })),
    ])
      .then(([orderData, customerData, catalogData]) => {
        if (!mounted) return
        setOrders(orderData.orders ?? [])
        setStatusSteps(orderData.statusSteps?.length ? orderData.statusSteps : FALLBACK_STATUS_STEPS)
        setCustomers(customerData.customers ?? [])
        setCatalogProducts(catalogData.products ?? [])
        setSelectedId((orderData.orders ?? [])[0]?.id ?? null)
        setError('')
      })
      .catch((err) => {
        if (mounted) setError(err.message)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [adminAuth.token])

  const filtered = useMemo(() => {
    return orders.filter((order) => {
      if (statusFilter && order.status !== statusFilter) return false
      if (query) {
        const q = query.toLowerCase()
        const haystack = [
          order.orderCode,
          order.customerName,
          order.customerCompany,
          order.product,
          order.catalogProductName,
          order.paymentMethod,
          order.shippingMethod,
        ].filter(Boolean).join(' ').toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [orders, query, statusFilter])

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedId) ?? filtered[0] ?? null,
    [orders, selectedId, filtered],
  )

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function openCreate() {
    setEditing({})
    setForm(EMPTY_FORM)
  }

  function openEdit(order) {
    setEditing(order)
    setForm(normalizeForm(order))
  }

  function closeModal() {
    setEditing(null)
    setSubmitting(false)
  }

  function handleCustomerChange(customerId) {
    const customer = customers.find((item) => item.id === customerId)
    const matchedProduct = catalogProducts.find((item) => item.name === customer?.mainProduct)
    setForm((current) => ({
      ...current,
      customerId,
      customerName: customer?.customerName ?? current.customerName,
      customerCompany: customer?.company ?? current.customerCompany,
      catalogProductId: matchedProduct?.id ?? (customer?.mainProduct ? `legacy:${customer.mainProduct}` : current.catalogProductId),
      catalogProductName: customer?.mainProduct ?? current.catalogProductName,
      paymentMethod: customer?.paymentMethod ?? current.paymentMethod,
      shippingMethod: customer?.preferredShippingMethod ?? current.shippingMethod,
    }))
  }

  function handleCatalogProductChange(productId) {
    const product = catalogProducts.find((item) => item.id === productId)
    setForm((current) => ({
      ...current,
      catalogProductId: productId,
      catalogProductName: productId ? product?.name ?? current.catalogProductName : '',
    }))
  }

  function handleQuantityUnitChange(quantityUnit) {
    setForm((current) => ({
      ...current,
      quantityUnit,
      quantity: PACKAGE_UNITS.has(quantityUnit) ? '' : current.quantity,
      packageWeightKg: PACKAGE_UNITS.has(quantityUnit) ? current.packageWeightKg : '',
      packageQuantity: PACKAGE_UNITS.has(quantityUnit) ? current.packageQuantity : '',
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const payload = cleanPayload(form)
    if (!payload.customerName || !payload.product || !payload.catalogProductName || payload.quantity <= 0) {
      setMessage('Cần nhập khách hàng, loại hàng, sản phẩm và số lượng hợp lệ.')
      return
    }
    setSubmitting(true)
    setMessage('')
    try {
      if (editing?.id) {
        const updated = await updateAdminExportOrder(adminAuth.token, editing.id, payload)
        setOrders((current) => current.map((order) => (order.id === editing.id ? updated : order)))
        setSelectedId(updated.id)
        setMessage('Đã cập nhật đơn hàng.')
      } else {
        const created = await createAdminExportOrder(adminAuth.token, payload)
        setOrders((current) => [created, ...current])
        setSelectedId(created.id)
        setMessage('Đã tạo đơn hàng xuất khẩu.')
      }
      closeModal()
    } catch (err) {
      setMessage(err.message)
      setSubmitting(false)
    }
  }

  async function handleStatusChange(orderId, status) {
    try {
      const updated = await updateAdminExportOrderStatus(adminAuth.token, orderId, {
        status,
        note: statusNote,
      })
      setOrders((current) => current.map((order) => (order.id === orderId ? updated : order)))
      setStatusNote('')
      setSelectedId(orderId)
      setMessage('Đã cập nhật trạng thái đơn hàng.')
    } catch (err) {
      setMessage(err.message)
    }
  }

  async function handleDelete(order) {
    if (!window.confirm(`Xóa đơn hàng ${order.orderCode}?`)) return
    try {
      await deleteAdminExportOrder(adminAuth.token, order.id)
      setOrders((current) => current.filter((item) => item.id !== order.id))
      setSelectedId(null)
      setMessage('Đã xóa đơn hàng.')
    } catch (err) {
      setMessage(err.message)
    }
  }

  return (
    <>
      <header className="admin-page-header">
        <div>
          <h1>Export Orders</h1>
          <p>Tạo đơn xuất khẩu, quản lý trạng thái, chi phí vốn và lợi nhuận.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          <IconPlus style={{ width: 16, height: 16 }} />
          Tạo đơn hàng
        </button>
      </header>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {message ? <div className="alert alert-info">{message}</div> : null}

      <div className="toolbar">
        <div className="field-search toolbar-grow">
          <span className="field-search-icon"><IconSearch /></span>
          <input className="field-input" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm mã đơn, khách hàng, loại hàng..." />
        </div>
        <select className="field-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} style={{ maxWidth: 260 }}>
          <option value="">Tất cả trạng thái</option>
          {statusSteps.map((step) => <option key={step.value} value={step.value}>{step.label}</option>)}
        </select>
      </div>

      <div className="export-order-layout">
        <div className="data-table-wrap">
          <div className="data-table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Loại hàng</th>
                  <th>Sản phẩm</th>
                  <th>Số lượng</th>
                  <th>Vốn</th>
                  <th>Lãi</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={9} className="cell-muted" style={{ textAlign: 'center', padding: 32 }}>Đang tải đơn hàng...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={9}><div className="empty-state"><strong>Chưa có đơn hàng phù hợp</strong><small>Thử bỏ bộ lọc hoặc tạo đơn hàng mới.</small></div></td></tr>
                ) : filtered.map((order) => (
                  <tr key={order.id} className={selectedOrder?.id === order.id ? 'is-selected' : ''} onClick={() => setSelectedId(order.id)}>
                    <td><strong>{order.orderCode}</strong></td>
                    <td><div className="cell-stack"><strong>{order.customerName}</strong><small>{order.customerCompany || '—'}</small></div></td>
                    <td>{order.product}</td>
                    <td>{order.catalogProductName || '—'}</td>
                    <td className="cell-muted">{quantityDescription(order)}</td>
                    <td>{money(order.totalCapital)}</td>
                    <td className={Number(order.totalProfit) >= 0 ? 'text-success' : 'text-danger'}>{money(order.totalProfit)}</td>
                    <td><span className="badge badge-info">{statusLabel(order.status, statusSteps)}</span></td>
                    <td>
                      <div className="data-table-actions">
                        <button type="button" className="btn btn-outline btn-sm" onClick={(event) => { event.stopPropagation(); openEdit(order) }}>
                          <IconEdit style={{ width: 14, height: 14 }} /> Sửa
                        </button>
                        <button type="button" className="btn btn-danger btn-sm" onClick={(event) => { event.stopPropagation(); handleDelete(order) }}>
                          <IconTrash style={{ width: 14, height: 14 }} /> Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <OrderProgressPanel
          order={selectedOrder}
          statusSteps={statusSteps}
          statusNote={statusNote}
          setStatusNote={setStatusNote}
          onStatusChange={handleStatusChange}
        />
      </div>

      {editing !== null ? (
        <OrderModal
          editing={editing}
          form={form}
          customers={customers}
          catalogProducts={catalogProducts}
          statusSteps={statusSteps}
          updateField={updateField}
          handleQuantityUnitChange={handleQuantityUnitChange}
          handleCustomerChange={handleCustomerChange}
          handleCatalogProductChange={handleCatalogProductChange}
          closeModal={closeModal}
          handleSubmit={handleSubmit}
          submitting={submitting}
        />
      ) : null}
    </>
  )
}

function OrderProgressPanel({ order, statusSteps, statusNote, setStatusNote, onStatusChange }) {
  if (!order) {
    return (
      <aside className="export-order-progress-panel">
        <p className="subsection-title">Tiến trình đơn hàng</p>
        <div className="empty-state"><strong>Chưa chọn đơn hàng</strong><small>Chọn một đơn hàng để xem tiến trình và lịch sử trạng thái.</small></div>
      </aside>
    )
  }
  const currentIndex = statusSteps.findIndex((step) => step.value === order.status)

  return (
    <aside className="export-order-progress-panel">
      <p className="subsection-title">Tiến trình đơn hàng</p>
      <h3>{order.orderCode}</h3>
      <p className="cell-muted">{order.customerName} • {order.product}</p>
      <p className="cell-muted">{order.catalogProductName || 'Chưa chọn sản phẩm catalog'}</p>
      <p className="cell-muted">{quantityDescription(order)}</p>

      <div className="export-order-money-grid">
        <div><span>Doanh thu sau bảo hiểm</span><strong>{money(order.totalRevenue)}</strong></div>
        <div><span>Bảo hiểm hàng hóa</span><strong>{money(order.cargoInsuranceAmount)}</strong></div>
        <div><span>Tổng vốn</span><strong>{money(order.totalCapital)}</strong></div>
        <div><span>Lợi nhuận</span><strong className={Number(order.totalProfit) >= 0 ? 'text-success' : 'text-danger'}>{money(order.totalProfit)}</strong></div>
      </div>

      <div className="order-progress-steps">
        {statusSteps.map((step, index) => (
          <button
            key={step.value}
            type="button"
            className={`${index < currentIndex ? 'is-done' : ''} ${index === currentIndex ? 'is-current' : ''}`}
            onClick={() => onStatusChange(order.id, step.value)}
          >
            <span>{index + 1}</span>
            <strong>{step.label}</strong>
          </button>
        ))}
      </div>

      <label className="field">
        <span className="field-label">Ghi chú khi đổi trạng thái</span>
        <textarea className="field-textarea" rows={3} value={statusNote} onChange={(event) => setStatusNote(event.target.value)} />
      </label>

      <div className="order-history-list">
        <p className="subsection-title">Lịch sử trạng thái</p>
        {(order.statusHistory ?? []).slice().reverse().map((item, index) => (
          <div key={`${item.status}-${item.changedAt}-${index}`}>
            <strong>{statusLabel(item.status, statusSteps)}</strong>
            <span>{formatDateTime(item.changedAt)}</span>
            {item.note ? <p>{item.note}</p> : null}
          </div>
        ))}
      </div>
    </aside>
  )
}

function OrderModal({
  editing,
  form,
  customers,
  catalogProducts,
  statusSteps,
  updateField,
  handleQuantityUnitChange,
  handleCustomerChange,
  handleCatalogProductChange,
  closeModal,
  handleSubmit,
  submitting,
}) {
  const preview = calculatePreview(form)
  const isPackageUnit = PACKAGE_UNITS.has(form.quantityUnit)
  return (
    <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
      <div className="admin-modal admin-modal-large">
        <header className="admin-modal-header">
          <div>
            <h3>{editing?.id ? 'Chỉnh sửa đơn hàng' : 'Tạo đơn hàng xuất khẩu'}</h3>
            <p style={{ margin: '4px 0 0', color: 'var(--admin-text-soft)', fontSize: '0.85rem' }}>Tổng vốn = đơn giá/kg x tổng khối lượng kg + tổng tiền vận chuyển.</p>
          </div>
          <button type="button" className="admin-icon-button" onClick={closeModal} aria-label="Đóng"><IconClose /></button>
        </header>

        <form className="admin-customer-form" onSubmit={handleSubmit}>
          <div className="admin-customer-form-grid">
            <label className="field">
              <span className="field-label">Khách hàng có sẵn</span>
              <select className="field-select" value={form.customerId} onChange={(event) => handleCustomerChange(event.target.value)}>
                <option value="">Nhập khách hàng thủ công</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>{customer.customerName} {customer.company ? `- ${customer.company}` : ''}</option>
                ))}
              </select>
            </label>
            <Field label="Tên khách hàng" value={form.customerName} onChange={(value) => updateField('customerName', value)} required />
            <Field label="Công ty" value={form.customerCompany} onChange={(value) => updateField('customerCompany', value)} />
            <label className="field">
              <span className="field-label">Loại hàng</span>
              <select className="field-select" value={form.product} onChange={(event) => updateField('product', event.target.value)} required>
                <option value="">Chọn loại hàng</option>
                {form.product && !PRODUCT_TYPES.includes(form.product) ? (
                  <option value={form.product}>{form.product}</option>
                ) : null}
                {PRODUCT_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="field-label">Sản phẩm</span>
              <select className="field-select" value={form.catalogProductId} onChange={(event) => handleCatalogProductChange(event.target.value)} required>
                <option value="">Chọn sản phẩm từ danh mục</option>
                {form.catalogProductName && !catalogProducts.some((product) => product.id === form.catalogProductId) ? (
                  <option value={form.catalogProductId}>{form.catalogProductName}</option>
                ) : null}
                {catalogProducts.map((product) => (
                  <option key={product.id} value={product.id}>{product.name}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="field-label">Đơn vị khối lượng</span>
              <select className="field-select" value={form.quantityUnit} onChange={(event) => handleQuantityUnitChange(event.target.value)}>
                {QUANTITY_UNITS.map((unit) => <option key={unit.value} value={unit.value}>{unit.label}</option>)}
              </select>
            </label>
            {isPackageUnit ? (
              <>
                <Field label="Kg / thùng, hộp, bao..." type="number" value={form.packageWeightKg} onChange={(value) => updateField('packageWeightKg', value)} required />
                <Field label="Số lượng thùng, hộp, bao..." type="number" value={form.packageQuantity} onChange={(value) => updateField('packageQuantity', value)} required />
              </>
            ) : (
              <Field label="Tổng khối lượng nhập hàng (kg)" type="number" value={form.quantity} onChange={(value) => updateField('quantity', value)} required />
            )}
            <label className="field">
              <span className="field-label">Phương thức thanh toán</span>
              <select className="field-select" value={form.paymentMethod} onChange={(event) => updateField('paymentMethod', event.target.value)}>
                <option value="">Chọn phương thức</option>
                {form.paymentMethod && !PAYMENT_METHODS.includes(form.paymentMethod) ? (
                  <option value={form.paymentMethod}>{form.paymentMethod}</option>
                ) : null}
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="field-label">Hình thức vận chuyển</span>
              <select className="field-select" value={form.shippingMethod} onChange={(event) => updateField('shippingMethod', event.target.value)}>
                <option value="">Chọn hình thức</option>
                {form.shippingMethod && !SHIPPING_METHODS.includes(form.shippingMethod) ? (
                  <option value={form.shippingMethod}>{form.shippingMethod}</option>
                ) : null}
                {SHIPPING_METHODS.map((method) => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </label>
            <Field label="Đơn giá nhập tại xưởng / kg" type="number" value={form.factoryUnitPrice} onChange={(value) => updateField('factoryUnitPrice', value)} required />
            <Field label="Đơn giá bán cho khách / kg" type="number" value={form.sellingUnitPrice} onChange={(value) => updateField('sellingUnitPrice', value)} required />
            <Field label="Bảo hiểm hàng hóa (%)" type="number" value={form.cargoInsurancePercent} onChange={(value) => updateField('cargoInsurancePercent', value)} />
            <Field label="Tổng tiền vận chuyển" type="number" value={form.shippingTotal} onChange={(value) => updateField('shippingTotal', value)} required />
            <label className="field">
              <span className="field-label">Trạng thái đơn hàng</span>
              <select className="field-select" value={form.status} onChange={(event) => updateField('status', event.target.value)}>
                {statusSteps.map((step) => <option key={step.value} value={step.value}>{step.label}</option>)}
              </select>
            </label>
            <Field label="Ghi chú trạng thái" value={form.statusNote} onChange={(value) => updateField('statusNote', value)} />
          </div>

          <div className="export-order-calculation-preview">
            <div><span>Tổng khối lượng</span><strong>{money(calculateTotalWeight(form))} kg</strong></div>
            <div><span>Tổng tiền tại xưởng</span><strong>{money(preview.totalFactoryCost)}</strong></div>
            <div><span>Doanh thu gốc</span><strong>{money(preview.baseRevenue)}</strong></div>
            <div><span>Bảo hiểm hàng hóa</span><strong>{money(preview.cargoInsuranceAmount)}</strong></div>
            <div><span>Doanh thu sau bảo hiểm</span><strong>{money(preview.totalRevenue)}</strong></div>
            <div><span>Tổng tiền vốn</span><strong>{money(preview.totalCapital)}</strong></div>
            <div><span>Tổng tiền lãi</span><strong className={preview.totalProfit >= 0 ? 'text-success' : 'text-danger'}>{money(preview.totalProfit)}</strong></div>
          </div>

          <label className="field">
            <span className="field-label">Ghi chú đơn hàng</span>
            <textarea className="field-textarea" rows={4} value={form.notes} onChange={(event) => updateField('notes', event.target.value)} />
          </label>

          <div className="admin-modal-footer">
            <button type="button" className="btn btn-outline" onClick={closeModal}>Hủy</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Đang lưu...' : 'Lưu đơn hàng'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', required = false }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <input className="field-input" type={type} step={type === 'number' ? '0.01' : undefined} value={value} onChange={(event) => onChange(event.target.value)} required={required} />
    </label>
  )
}
