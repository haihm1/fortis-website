import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { IconNavigation } from '../../admin/AdminIcons'
import {
  getAdminNavigation,
  updateAdminNavigation,
} from '../../services/admin/adminApi'

const MENU_HINTS = {
  home: 'Trang chủ /',
  about: 'About Us section /#company-profile',
  services: 'Services section /#categories',
  products: 'Danh mục sản phẩm /products',
  'export-market': 'Export Market /export-market',
}

export function NavigationMenuAdminPage() {
  const { adminAuth } = useOutletContext()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let mounted = true
    getAdminNavigation(adminAuth.token)
      .then((data) => {
        if (mounted) setItems(data.items ?? [])
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

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => a.sortOrder - b.sortOrder),
    [items],
  )

  function updateItem(key, field, value) {
    setItems((current) =>
      current.map((item) => (item.key === key ? { ...item, [field]: value } : item)),
    )
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')
    setError('')
    setSaving(true)

    try {
      const payload = sortedItems.map((item) => ({
        key: item.key,
        labelVi: item.labelVi,
        labelEn: item.labelEn,
        labelZh: item.labelZh,
        path: item.path,
        sortOrder: Number(item.sortOrder),
        visible: Boolean(item.visible),
      }))
      const updated = await updateAdminNavigation(adminAuth.token, payload)
      setItems(updated.items ?? [])
      setMessage('Đã lưu menu điều hướng. Client sẽ dùng cấu hình mới từ public API.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <header className="admin-page-header">
        <div>
          <h1>Navigation Menu</h1>
          <p>Quản lý menu public: label đa ngôn ngữ, thứ tự hiển thị và quyền truy cập URL.</p>
        </div>
      </header>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {message ? <div className="alert alert-success">{message}</div> : null}

      {loading ? (
        <div className="empty-state">
          <strong>Đang tải menu...</strong>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="surface-card">
          <header className="surface-card-header">
            <div>
              <h2>Public Menu Items</h2>
              <p>Tắt menu sẽ ẩn trên header và chặn truy cập URL tương ứng ở client.</p>
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <IconNavigation style={{ width: 16, height: 16 }} />
              {saving ? 'Đang lưu...' : 'Lưu menu'}
            </button>
          </header>

          <div className="data-table-scroll">
            <table className="data-table navigation-admin-table" style={{ minWidth: 1040 }}>
              <thead>
                <tr>
                  <th>Key</th>
                  <th>Label VI</th>
                  <th>Label EN</th>
                  <th>Label ZH</th>
                  <th>URL</th>
                  <th>Thứ tự</th>
                  <th>Hiển thị</th>
                </tr>
              </thead>
              <tbody>
                {sortedItems.map((item) => (
                  <tr key={item.key}>
                    <td>
                      <div className="cell-stack">
                        <strong>{item.key}</strong>
                        <small>{MENU_HINTS[item.key] ?? 'Public navigation item'}</small>
                      </div>
                    </td>
                    <td>
                      <input
                        className="field-input"
                        value={item.labelVi}
                        onChange={(event) => updateItem(item.key, 'labelVi', event.target.value)}
                        required
                      />
                    </td>
                    <td>
                      <input
                        className="field-input"
                        value={item.labelEn}
                        onChange={(event) => updateItem(item.key, 'labelEn', event.target.value)}
                        required
                      />
                    </td>
                    <td>
                      <input
                        className="field-input"
                        value={item.labelZh ?? ''}
                        onChange={(event) => updateItem(item.key, 'labelZh', event.target.value)}
                        placeholder="中文 label"
                      />
                    </td>
                    <td>
                      <input
                        className="field-input"
                        value={item.path}
                        readOnly
                        required
                      />
                    </td>
                    <td>
                      <input
                        className="field-input"
                        type="number"
                        value={item.sortOrder}
                        onChange={(event) => updateItem(item.key, 'sortOrder', event.target.value)}
                        style={{ width: 92 }}
                      />
                    </td>
                    <td>
                      <label className="toggle">
                        <input
                          type="checkbox"
                          checked={item.visible}
                          onChange={(event) => updateItem(item.key, 'visible', event.target.checked)}
                        />
                        <span className="toggle-track" aria-hidden="true" />
                        <span className="toggle-label">{item.visible ? 'On' : 'Off'}</span>
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </form>
      )}
    </>
  )
}
