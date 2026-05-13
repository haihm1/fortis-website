import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { IconClose, IconSearch } from '../../admin/AdminIcons'
import {
  getAdminContacts,
  updateAdminContactStatus,
} from '../../services/admin/adminApi'

const STATUS_OPTIONS = [
  { value: 'NEW', label: 'Mới', badge: 'badge-success' },
  { value: 'IN_PROGRESS', label: 'Đang xử lý', badge: 'badge-warn' },
  { value: 'QUOTED', label: 'Đã báo giá', badge: 'badge-info' },
  { value: 'CLOSED', label: 'Đã đóng', badge: 'badge-muted' },
]

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

export function RfqManagementPage() {
  const { adminAuth } = useOutletContext()
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [marketFilter, setMarketFilter] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [selectedId, setSelectedId] = useState(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError('')
    getAdminContacts(adminAuth.token)
      .then((data) => {
        if (mounted) setContacts(data.contacts ?? [])
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

  const markets = useMemo(() => {
    const set = new Set()
    contacts.forEach((c) => {
      if (c.targetMarket) set.add(c.targetMarket)
    })
    return Array.from(set).sort()
  }, [contacts])

  const filtered = useMemo(() => {
    return contacts.filter((c) => {
      if (statusFilter && c.status !== statusFilter) return false
      if (marketFilter && c.targetMarket !== marketFilter) return false
      if (query) {
        const q = query.toLowerCase()
        const haystack = [
          c.fullName,
          c.companyName,
          c.email,
          c.phoneNumber,
          c.productInterest,
          c.targetMarket,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(q)) return false
      }
      if (fromDate) {
        if (!c.createdAt || new Date(c.createdAt) < new Date(fromDate)) return false
      }
      if (toDate) {
        const limit = new Date(toDate)
        limit.setHours(23, 59, 59, 999)
        if (!c.createdAt || new Date(c.createdAt) > limit) return false
      }
      return true
    })
  }, [contacts, statusFilter, marketFilter, query, fromDate, toDate])

  const selected = useMemo(
    () => contacts.find((c) => c.id === selectedId) ?? null,
    [contacts, selectedId],
  )

  async function handleStatusChange(contactId, nextStatus) {
    try {
      setMessage('')
      const updated = await updateAdminContactStatus(adminAuth.token, contactId, nextStatus)
      setContacts((current) =>
        current.map((c) => (c.id === contactId ? updated : c)),
      )
      setMessage('Đã cập nhật trạng thái yêu cầu.')
    } catch (err) {
      setMessage(err.message)
    }
  }

  return (
    <>
      <header className="admin-page-header">
        <div>
          <h1>RFQ Management</h1>
          <p>Quản lý yêu cầu báo giá và liên hệ từ khách hàng quốc tế.</p>
        </div>
      </header>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {message ? <div className="alert alert-success">{message}</div> : null}

      <div className="toolbar">
        <div className="field-search toolbar-grow">
          <span className="field-search-icon">
            <IconSearch />
          </span>
          <input
            className="field-input"
            type="search"
            placeholder="Tìm theo tên, công ty, email, sản phẩm..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <input
          type="date"
          className="field-input"
          value={fromDate}
          onChange={(event) => setFromDate(event.target.value)}
          aria-label="Từ ngày"
          style={{ maxWidth: 170 }}
        />
        <input
          type="date"
          className="field-input"
          value={toDate}
          onChange={(event) => setToDate(event.target.value)}
          aria-label="Đến ngày"
          style={{ maxWidth: 170 }}
        />
        <select
          className="field-select"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          style={{ maxWidth: 200 }}
        >
          <option value="">Tất cả trạng thái</option>
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          className="field-select"
          value={marketFilter}
          onChange={(event) => setMarketFilter(event.target.value)}
          style={{ maxWidth: 220 }}
        >
          <option value="">Tất cả thị trường</option>
          {markets.map((market) => (
            <option key={market} value={market}>
              {market}
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
                <th>Thị trường</th>
                <th>Sản phẩm quan tâm</th>
                <th>Số lượng</th>
                <th>Ngày nhận</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="cell-muted" style={{ textAlign: 'center', padding: 32 }}>
                    Đang tải danh sách RFQ...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <strong>Không có RFQ phù hợp</strong>
                      <small>Thử bỏ bớt bộ lọc hoặc khoảng ngày.</small>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((contact) => {
                  const meta = statusMeta(contact.status)
                  return (
                    <tr key={contact.id}>
                      <td>
                        <div className="cell-stack">
                          <strong>{contact.fullName}</strong>
                          <small>{contact.email}</small>
                        </div>
                      </td>
                      <td className="cell-muted">{contact.companyName || '—'}</td>
                      <td className="cell-muted">{contact.targetMarket || '—'}</td>
                      <td>{contact.productInterest || '—'}</td>
                      <td className="cell-muted">{contact.requestedQuantity || '—'}</td>
                      <td className="cell-muted">{formatDateTime(contact.createdAt)}</td>
                      <td>
                        <span className={`badge ${meta.badge}`}>{meta.label}</span>
                      </td>
                      <td>
                        <div className="data-table-actions">
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() => setSelectedId(contact.id)}
                          >
                            Chi tiết
                          </button>
                          <select
                            className="field-select btn-sm"
                            value={contact.status}
                            onChange={(event) =>
                              handleStatusChange(contact.id, event.target.value)
                            }
                            style={{ minWidth: 140 }}
                            aria-label="Cập nhật trạng thái"
                          >
                            {STATUS_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
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

      {selected ? (
        <div
          className="admin-modal-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={(event) => {
            if (event.target === event.currentTarget) setSelectedId(null)
          }}
        >
          <div className="admin-modal admin-modal-large">
            <header className="admin-modal-header">
              <div>
                <h3>{selected.fullName}</h3>
                <p style={{ color: 'var(--admin-text-soft)', margin: '4px 0 0' }}>
                  {selected.companyName || 'Khách lẻ'} · {formatDateTime(selected.createdAt)}
                </p>
              </div>
              <button
                type="button"
                className="admin-icon-button"
                onClick={() => setSelectedId(null)}
                aria-label="Đóng"
              >
                <IconClose />
              </button>
            </header>

            <div style={{ display: 'grid', gap: 14 }}>
              <div className="surface-card compact" style={{ display: 'grid', gap: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
                  <Field label="Email" value={selected.email} />
                  <Field label="Điện thoại" value={selected.phoneNumber} />
                  <Field label="Thị trường" value={selected.targetMarket} />
                  <Field label="Số lượng dự kiến" value={selected.requestedQuantity} />
                  <Field label="Sản phẩm quan tâm" value={selected.productInterest} />
                  <Field
                    label="Trạng thái"
                    value={
                      <span className={`badge ${statusMeta(selected.status).badge}`}>
                        {statusMeta(selected.status).label}
                      </span>
                    }
                  />
                </div>
              </div>

              {selected.specificationDetails ? (
                <Field label="Quy cách chi tiết" value={selected.specificationDetails} block />
              ) : null}
              {selected.message ? (
                <Field label="Nội dung" value={selected.message} block />
              ) : null}
              {selected.attachmentUrl ? (
                <Field
                  label="Tệp đính kèm"
                  value={
                    <a href={selected.attachmentUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--admin-accent)' }}>
                      {selected.attachmentUrl}
                    </a>
                  }
                  block
                />
              ) : null}
            </div>

            <div className="admin-modal-footer">
              <select
                className="field-select"
                value={selected.status}
                onChange={(event) => handleStatusChange(selected.id, event.target.value)}
                style={{ minWidth: 200 }}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    Đặt trạng thái: {option.label}
                  </option>
                ))}
              </select>
              <button type="button" className="btn btn-outline" onClick={() => setSelectedId(null)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

function Field({ label, value, block = false }) {
  return (
    <div style={{ display: 'grid', gap: 4, gridColumn: block ? '1 / -1' : undefined }}>
      <span style={{ color: 'var(--admin-text-soft)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </span>
      <div style={{ color: 'var(--admin-text)', fontSize: '0.94rem', whiteSpace: 'pre-wrap' }}>
        {value || '—'}
      </div>
    </div>
  )
}
