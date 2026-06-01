import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { IconClose, IconEdit, IconPlus, IconSearch, IconTrash } from '../../admin/AdminIcons'
import {
  createAdminCustomer,
  deleteAdminCustomer,
  getAdminCustomers,
  updateAdminCustomer,
} from '../../services/admin/adminApi'

const STATUS_OPTIONS = [
  { value: 'NOT_CONTACTED', label: 'Chưa liên hệ', badge: 'badge-muted' },
  { value: 'CONTACTED', label: 'Đã liên hệ', badge: 'badge-info' },
  { value: 'FOLLOW_UP', label: 'Cần follow-up', badge: 'badge-warn' },
  { value: 'QUALIFIED', label: 'Tiềm năng', badge: 'badge-success' },
  { value: 'CLOSED', label: 'Đã đóng', badge: 'badge-muted' },
]

const EMPTY_FORM = {
  customerName: '',
  country: '',
  company: '',
  positionTitle: '',
  phoneNumbers: [''],
  email: '',
  website: '',
  mainProduct: '',
  contactStatus: 'NOT_CONTACTED',
  hsCode: '',
  packingSpecification: '',
  labelingRequirement: '',
  incoterms: '',
  destinationPort: '',
  preferredShippingMethod: '',
  expectedTransitTime: '',
  paymentMethod: '',
  requiredDocuments: '',
  notes: '',
}

function statusMeta(status) {
  return STATUS_OPTIONS.find((option) => option.value === status) ?? {
    value: status,
    label: status,
    badge: 'badge-muted',
  }
}

function formatDateTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })
}

function normalizeCustomerForm(customer) {
  return {
    ...EMPTY_FORM,
    ...customer,
    phoneNumbers: customer.phoneNumbers?.length ? customer.phoneNumbers : [''],
    contactApplications: [],
  }
}

function cleanPayload(form) {
  const phoneNumbers = form.phoneNumbers.map((phone) => phone.trim()).filter(Boolean)
  return {
    ...form,
    customerName: form.customerName.trim(),
    phoneNumbers,
    contactApplications: [],
  }
}

export function CustomerManagementPage() {
  const { adminAuth } = useOutletContext()
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let mounted = true
    getAdminCustomers(adminAuth.token)
      .then((data) => {
        if (mounted) {
          setCustomers(data.customers ?? [])
          setError('')
        }
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
    return customers.filter((customer) => {
      if (statusFilter && customer.contactStatus !== statusFilter) return false
      if (query) {
        const q = query.toLowerCase()
        const haystack = [
          customer.customerName,
          customer.country,
          customer.company,
          customer.positionTitle,
          customer.email,
          customer.mainProduct,
          customer.hsCode,
          ...(customer.phoneNumbers ?? []),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [customers, query, statusFilter])

  function openCreate() {
    setEditing({})
    setForm(EMPTY_FORM)
  }

  function openEdit(customer) {
    setEditing(customer)
    setForm(normalizeCustomerForm(customer))
  }

  function closeModal() {
    setEditing(null)
    setSubmitting(false)
  }

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function updatePhone(index, value) {
    setForm((current) => ({
      ...current,
      phoneNumbers: current.phoneNumbers.map((phone, phoneIndex) =>
        phoneIndex === index ? value : phone,
      ),
    }))
  }

  function addPhone() {
    setForm((current) => ({ ...current, phoneNumbers: [...current.phoneNumbers, ''] }))
  }

  function removePhone(index) {
    setForm((current) => ({
      ...current,
      phoneNumbers: current.phoneNumbers.filter((_, phoneIndex) => phoneIndex !== index),
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const payload = cleanPayload(form)
    if (!payload.customerName) {
      setMessage('Tên khách hàng là bắt buộc.')
      return
    }

    setSubmitting(true)
    setMessage('')
    try {
      if (editing?.id) {
        const updated = await updateAdminCustomer(adminAuth.token, editing.id, payload)
        setCustomers((current) =>
          current.map((customer) => (customer.id === editing.id ? updated : customer)),
        )
        setMessage('Đã cập nhật khách hàng.')
      } else {
        const created = await createAdminCustomer(adminAuth.token, payload)
        setCustomers((current) => [created, ...current])
        setMessage('Đã thêm khách hàng mới.')
      }
      closeModal()
    } catch (err) {
      setMessage(err.message)
      setSubmitting(false)
    }
  }

  async function handleDelete(customer) {
    const confirmed = window.confirm(`Xóa khách hàng "${customer.customerName}"?`)
    if (!confirmed) return

    try {
      await deleteAdminCustomer(adminAuth.token, customer.id)
      setCustomers((current) => current.filter((item) => item.id !== customer.id))
      setMessage('Đã xóa khách hàng.')
    } catch (err) {
      setMessage(err.message)
    }
  }

  return (
    <>
      <header className="admin-page-header">
        <div>
          <h1>Customer Leads</h1>
          <p>Lưu và quản lý khách hàng từ email, WhatsApp, Zalo, WeChat và các kênh bán hàng khác.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          <IconPlus style={{ width: 16, height: 16 }} />
          Thêm khách hàng
        </button>
      </header>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {message ? <div className="alert alert-info">{message}</div> : null}

      <div className="toolbar">
        <div className="field-search toolbar-grow">
          <span className="field-search-icon">
            <IconSearch />
          </span>
          <input
            className="field-input"
            type="search"
            placeholder="Tìm theo tên, công ty, quốc gia, email, sản phẩm, HS code..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <select
          className="field-select"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          style={{ maxWidth: 220 }}
        >
          <option value="">Tất cả trạng thái</option>
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="data-table-wrap">
        <div className="data-table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Công ty</th>
                <th>Quốc gia</th>
                <th>Số điện thoại</th>
                <th>Mặt hàng</th>
                <th>Trạng thái</th>
                <th>Cập nhật</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="cell-muted" style={{ textAlign: 'center', padding: 32 }}>
                    Đang tải khách hàng...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <strong>Chưa có khách hàng phù hợp</strong>
                      <small>Thử bỏ bộ lọc hoặc thêm khách hàng mới.</small>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((customer) => {
                  const meta = statusMeta(customer.contactStatus)
                  return (
                    <tr key={customer.id}>
                      <td>
                        <div className="cell-stack">
                          <strong>{customer.customerName}</strong>
                          <small>{customer.email || '—'}</small>
                        </div>
                      </td>
                      <td className="cell-muted">{customer.company || '—'}</td>
                      <td className="cell-muted">{customer.country || '—'}</td>
                      <td>
                        <div className="cell-stack">
                          <strong>{customer.phoneNumbers?.[0] || '—'}</strong>
                          <small>{customer.phoneNumbers?.slice(1).join(', ') || '—'}</small>
                        </div>
                      </td>
                      <td>{customer.mainProduct || '—'}</td>
                      <td>
                        <span className={`badge ${meta.badge}`}>{meta.label}</span>
                      </td>
                      <td className="cell-muted">{formatDateTime(customer.updatedAt)}</td>
                      <td>
                        <div className="data-table-actions">
                          <button type="button" className="btn btn-outline btn-sm" onClick={() => openEdit(customer)}>
                            <IconEdit style={{ width: 14, height: 14 }} />
                            Sửa
                          </button>
                          <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(customer)}>
                            <IconTrash style={{ width: 14, height: 14 }} />
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing !== null ? (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="customer-modal-title">
          <div className="admin-modal admin-modal-large">
            <header className="admin-modal-header">
              <div>
                <h3 id="customer-modal-title">{editing?.id ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng'}</h3>
                <p style={{ margin: '4px 0 0', color: 'var(--admin-text-soft)', fontSize: '0.85rem' }}>
                  Nhập thông tin liên hệ, sản phẩm, vận chuyển và chứng từ.
                </p>
              </div>
              <button type="button" className="admin-icon-button" onClick={closeModal} aria-label="Đóng">
                <IconClose />
              </button>
            </header>

            <form className="admin-customer-form" onSubmit={handleSubmit}>
              <CustomerFormFields
                form={form}
                updateField={updateField}
                updatePhone={updatePhone}
                addPhone={addPhone}
                removePhone={removePhone}
              />

              <div className="admin-modal-footer">
                <button type="button" className="btn btn-outline" onClick={closeModal}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Đang lưu...' : 'Lưu khách hàng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  )
}

function CustomerFormFields({
  form,
  updateField,
  updatePhone,
  addPhone,
  removePhone,
}) {
  return (
    <>
      <section className="surface-card compact">
        <header className="surface-card-header">
          <div>
            <h3>Thông tin khách hàng</h3>
            <p>Thông tin định danh và nguồn liên hệ chính.</p>
          </div>
        </header>
        <div className="admin-customer-form-grid">
          <TextField label="Tên khách hàng" value={form.customerName} onChange={(value) => updateField('customerName', value)} required />
          <TextField label="Quốc gia" value={form.country} onChange={(value) => updateField('country', value)} />
          <TextField label="Công ty" value={form.company} onChange={(value) => updateField('company', value)} />
          <TextField label="Chức vụ" value={form.positionTitle} onChange={(value) => updateField('positionTitle', value)} />
          <TextField label="Email" type="email" value={form.email} onChange={(value) => updateField('email', value)} />
          <TextField label="Website" type="url" value={form.website} onChange={(value) => updateField('website', value)} />
          <label className="field">
            <span className="field-label">Trạng thái liên hệ</span>
            <select className="field-select" value={form.contactStatus} onChange={(event) => updateField('contactStatus', event.target.value)}>
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <TextField label="Mặt hàng chủ đạo" value={form.mainProduct} onChange={(value) => updateField('mainProduct', value)} />
        </div>
      </section>

      <section className="surface-card compact">
        <header className="surface-card-header">
          <div>
            <h3>Số điện thoại</h3>
            <p>Có thể lưu nhiều số điện thoại cho cùng một khách hàng.</p>
          </div>
        </header>
        <div style={{ display: 'grid', gap: 12 }}>
          {form.phoneNumbers.map((phone, index) => (
            <div className="admin-dynamic-row" key={index}>
              <input
                className="field-input"
                value={phone}
                onChange={(event) => updatePhone(index, event.target.value)}
                placeholder={`Số điện thoại #${index + 1}`}
              />
              <button type="button" className="btn btn-ghost btn-icon" onClick={() => removePhone(index)} disabled={form.phoneNumbers.length === 1}>
                <IconTrash />
              </button>
            </div>
          ))}
          <button type="button" className="btn btn-outline btn-sm" onClick={addPhone} style={{ justifySelf: 'start' }}>
            <IconPlus style={{ width: 14, height: 14 }} />
            Thêm số điện thoại
          </button>
        </div>
      </section>

      <section className="surface-card compact">
        <header className="surface-card-header">
          <div>
            <h3>Yêu cầu sản phẩm và logistics</h3>
            <p>Thông tin phục vụ báo giá, chứng từ và điều phối vận chuyển.</p>
          </div>
        </header>
        <div className="admin-customer-form-grid">
          <TextField label="Mã HS code" value={form.hsCode} onChange={(value) => updateField('hsCode', value)} />
          <TextField label="Điều kiện Incoterms" value={form.incoterms} onChange={(value) => updateField('incoterms', value)} />
          <TextField label="Cảng đích" value={form.destinationPort} onChange={(value) => updateField('destinationPort', value)} />
          <TextField label="Phương thức vận chuyển ưu tiên" value={form.preferredShippingMethod} onChange={(value) => updateField('preferredShippingMethod', value)} />
          <TextField label="Thời gian vận chuyển kỳ vọng" value={form.expectedTransitTime} onChange={(value) => updateField('expectedTransitTime', value)} />
          <TextField label="Phương thức thanh toán" value={form.paymentMethod} onChange={(value) => updateField('paymentMethod', value)} />
        </div>
        <div className="admin-customer-textarea-grid">
          <TextareaField label="Quy cách đóng gói" value={form.packingSpecification} onChange={(value) => updateField('packingSpecification', value)} />
          <TextareaField label="Yêu cầu nhãn mác" value={form.labelingRequirement} onChange={(value) => updateField('labelingRequirement', value)} />
          <TextareaField label="Bộ chứng từ bắt buộc" value={form.requiredDocuments} onChange={(value) => updateField('requiredDocuments', value)} />
          <TextareaField label="Ghi chú" value={form.notes} onChange={(value) => updateField('notes', value)} />
        </div>
      </section>
    </>
  )
}

function TextField({ label, value, onChange, type = 'text', required = false }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <input className="field-input" type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} />
    </label>
  )
}

function TextareaField({ label, value, onChange }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <textarea className="field-textarea" rows={4} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}
