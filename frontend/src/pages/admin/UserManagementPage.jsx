import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  IconClose,
  IconEdit,
  IconKey,
  IconLock,
  IconPlus,
  IconSearch,
  IconUnlock,
} from '../../admin/AdminIcons'
import {
  changeAdminPassword,
  createAdminAccount,
  getAdminAccounts,
  updateAdminAccount,
} from '../../services/admin/adminApi'

const ROLE_OPTIONS = [
  { value: 'SUPER_ADMIN', label: 'Super Admin', badge: 'badge-success' },
  { value: 'CONTENT_EDITOR', label: 'Content Editor', badge: 'badge-info' },
  { value: 'CONTENT_PUBLISHER', label: 'Content Publisher', badge: 'badge-info' },
  { value: 'CONTACT_MANAGER', label: 'Contact Manager', badge: 'badge-warn' },
  { value: 'ACCOUNT_MANAGER', label: 'Account Manager', badge: 'badge-warn' },
]

function roleMeta(value) {
  return ROLE_OPTIONS.find((option) => option.value === value) ?? {
    value,
    label: value,
    badge: 'badge-muted',
  }
}

const EMPTY_FORM = {
  username: '',
  displayName: '',
  email: '',
  active: true,
  roles: ['CONTENT_EDITOR'],
}

export function UserManagementPage() {
  const { adminAuth } = useOutletContext()
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [editing, setEditing] = useState(null) // null = closed, {} = new, account = edit
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [passwordTarget, setPasswordTarget] = useState(null)
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' })

  useEffect(() => {
    let mounted = true
    getAdminAccounts(adminAuth.token)
      .then((data) => {
        if (mounted) {
          setAccounts(data.accounts ?? [])
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
    return accounts.filter((account) => {
      if (roleFilter && !account.roles.includes(roleFilter)) return false
      if (query) {
        const q = query.toLowerCase()
        const haystack = [account.username, account.displayName, account.email]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [accounts, roleFilter, query])

  function openCreate() {
    setEditing({})
    setForm(EMPTY_FORM)
  }

  function openEdit(account) {
    setEditing(account)
    setForm({
      username: account.username,
      displayName: account.displayName,
      email: account.email,
      active: account.active,
      roles: account.roles ?? [],
    })
  }

  function closeModal() {
    setEditing(null)
    setSubmitting(false)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (form.roles.length === 0) {
      setMessage('Cần chọn tối thiểu 1 vai trò.')
      return
    }
    setSubmitting(true)
    setMessage('')
    try {
      if (editing && editing.id) {
        const updated = await updateAdminAccount(adminAuth.token, editing.id, form)
        setAccounts((current) =>
          current.map((account) => (account.id === editing.id ? updated : account)),
        )
        setMessage('Đã cập nhật tài khoản.')
      } else {
        const created = await createAdminAccount(adminAuth.token, form)
        setAccounts((current) => [...current, created])
        setMessage('Đã tạo tài khoản mới. Mật khẩu mặc định: ChangeMe@123')
      }
      closeModal()
    } catch (err) {
      setMessage(err.message)
      setSubmitting(false)
    }
  }

  async function handleToggleActive(account) {
    setMessage('')
    try {
      const payload = {
        username: account.username,
        displayName: account.displayName,
        email: account.email,
        active: !account.active,
        roles: account.roles,
      }
      const updated = await updateAdminAccount(adminAuth.token, account.id, payload)
      setAccounts((current) =>
        current.map((item) => (item.id === account.id ? updated : item)),
      )
      setMessage(updated.active ? 'Đã mở khóa tài khoản.' : 'Đã khóa tài khoản.')
    } catch (err) {
      setMessage(err.message)
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault()
    if (!passwordTarget) return
    try {
      const result = await changeAdminPassword(adminAuth.token, passwordTarget.id, passwordForm)
      setMessage(result.message || 'Đã đổi mật khẩu.')
      setPasswordTarget(null)
      setPasswordForm({ currentPassword: '', newPassword: '' })
    } catch (err) {
      setMessage(err.message)
    }
  }

  return (
    <>
      <header className="admin-page-header">
        <div>
          <h1>User Management</h1>
          <p>Quản lý tài khoản admin, vai trò và trạng thái hoạt động.</p>
        </div>
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
            placeholder="Tìm theo username, tên hiển thị hoặc email..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <select
          className="field-select"
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value)}
          style={{ maxWidth: 220 }}
        >
          <option value="">Lọc theo vai trò</option>
          {ROLE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="toolbar-spacer" />
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          <IconPlus style={{ width: 16, height: 16 }} />
          Thêm tài khoản
        </button>
      </div>

      <div className="data-table-wrap">
        <div className="data-table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Tên hiển thị</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="cell-muted" style={{ textAlign: 'center', padding: 32 }}>
                    Đang tải tài khoản...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">
                      <strong>Không có tài khoản phù hợp</strong>
                      <small>Thử bỏ bộ lọc hoặc thêm tài khoản mới.</small>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((account) => (
                  <tr key={account.id}>
                    <td>
                      <div className="cell-stack">
                        <strong>{account.username}</strong>
                        <small>{account.email}</small>
                      </div>
                    </td>
                    <td>{account.displayName}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {account.roles.map((role) => {
                          const meta = roleMeta(role)
                          return (
                            <span key={role} className={`badge ${meta.badge}`}>
                              {meta.label}
                            </span>
                          )
                        })}
                      </div>
                    </td>
                    <td>
                      <label className="toggle" title={account.active ? 'Đang hoạt động' : 'Đang khóa'}>
                        <input
                          type="checkbox"
                          checked={account.active}
                          onChange={() => handleToggleActive(account)}
                        />
                        <span className="toggle-track" />
                        <span className="toggle-label">
                          {account.active ? 'Active' : 'Locked'}
                        </span>
                      </label>
                    </td>
                    <td>
                      <div className="data-table-actions">
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => openEdit(account)}
                        >
                          <IconEdit style={{ width: 14, height: 14 }} />
                          Sửa
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => {
                            setPasswordTarget(account)
                            setPasswordForm({ currentPassword: '', newPassword: '' })
                          }}
                        >
                          <IconKey style={{ width: 14, height: 14 }} />
                          Mật khẩu
                        </button>
                        <button
                          type="button"
                          className={`btn ${account.active ? 'btn-danger' : 'btn-outline'} btn-sm`}
                          onClick={() => handleToggleActive(account)}
                        >
                          {account.active ? (
                            <>
                              <IconLock style={{ width: 14, height: 14 }} /> Khóa
                            </>
                          ) : (
                            <>
                              <IconUnlock style={{ width: 14, height: 14 }} /> Mở khóa
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing !== null ? (
        <div
          className="admin-modal-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeModal()
          }}
        >
          <div className="admin-modal">
            <header className="admin-modal-header">
              <div>
                <h3>{editing.id ? 'Cập nhật tài khoản' : 'Thêm tài khoản mới'}</h3>
                {!editing.id ? (
                  <p style={{ color: 'var(--admin-text-soft)', margin: '4px 0 0', fontSize: '0.85rem' }}>
                    Mật khẩu khởi tạo mặc định là ChangeMe@123.
                  </p>
                ) : null}
              </div>
              <button type="button" className="admin-icon-button" onClick={closeModal} aria-label="Đóng">
                <IconClose />
              </button>
            </header>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                <label className="field">
                  <span className="field-label">Username</span>
                  <input
                    className="field-input"
                    value={form.username}
                    onChange={(event) => setForm((c) => ({ ...c, username: event.target.value }))}
                    required
                    disabled={Boolean(editing.id)}
                  />
                </label>
                <label className="field">
                  <span className="field-label">Tên hiển thị</span>
                  <input
                    className="field-input"
                    value={form.displayName}
                    onChange={(event) => setForm((c) => ({ ...c, displayName: event.target.value }))}
                    required
                  />
                </label>
                <label className="field" style={{ gridColumn: '1 / -1' }}>
                  <span className="field-label">Email</span>
                  <input
                    type="email"
                    className="field-input"
                    value={form.email}
                    onChange={(event) => setForm((c) => ({ ...c, email: event.target.value }))}
                    required
                  />
                </label>
              </div>

              <div className="field">
                <span className="field-label">Vai trò</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
                  {ROLE_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      style={{
                        display: 'flex',
                        gap: 8,
                        alignItems: 'center',
                        padding: '8px 12px',
                        border: '1px solid var(--admin-border)',
                        borderRadius: 8,
                        background: form.roles.includes(option.value)
                          ? 'var(--admin-accent-dim)'
                          : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={form.roles.includes(option.value)}
                        onChange={(event) =>
                          setForm((c) => ({
                            ...c,
                            roles: event.target.checked
                              ? [...c.roles, option.value]
                              : c.roles.filter((role) => role !== option.value),
                          }))
                        }
                      />
                      <span style={{ fontSize: '0.88rem', color: 'var(--admin-text)' }}>
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <label className="toggle" style={{ marginTop: 4 }}>
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(event) => setForm((c) => ({ ...c, active: event.target.checked }))}
                />
                <span className="toggle-track" />
                <span className="toggle-label">Tài khoản đang hoạt động</span>
              </label>

              <div className="admin-modal-footer">
                <button type="button" className="btn btn-outline" onClick={closeModal}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Đang lưu...' : editing.id ? 'Lưu thay đổi' : 'Tạo tài khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {passwordTarget ? (
        <div
          className="admin-modal-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={(event) => {
            if (event.target === event.currentTarget) setPasswordTarget(null)
          }}
        >
          <div className="admin-modal">
            <header className="admin-modal-header">
              <div>
                <h3>Đổi mật khẩu</h3>
                <p style={{ color: 'var(--admin-text-soft)', margin: '4px 0 0', fontSize: '0.85rem' }}>
                  Tài khoản: {passwordTarget.username}
                </p>
              </div>
              <button
                type="button"
                className="admin-icon-button"
                onClick={() => setPasswordTarget(null)}
                aria-label="Đóng"
              >
                <IconClose />
              </button>
            </header>

            <form onSubmit={handlePasswordSubmit} style={{ display: 'grid', gap: 14 }}>
              <label className="field">
                <span className="field-label">Mật khẩu hiện tại</span>
                <input
                  type="password"
                  className="field-input"
                  value={passwordForm.currentPassword}
                  onChange={(event) =>
                    setPasswordForm((c) => ({ ...c, currentPassword: event.target.value }))
                  }
                  required
                />
              </label>
              <label className="field">
                <span className="field-label">Mật khẩu mới</span>
                <input
                  type="password"
                  className="field-input"
                  value={passwordForm.newPassword}
                  onChange={(event) =>
                    setPasswordForm((c) => ({ ...c, newPassword: event.target.value }))
                  }
                  required
                />
              </label>
              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setPasswordTarget(null)}
                >
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  Cập nhật mật khẩu
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  )
}
