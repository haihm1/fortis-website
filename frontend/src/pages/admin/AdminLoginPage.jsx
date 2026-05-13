import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { loginAdmin } from '../../services/admin/adminAuthApi'

export function AdminLoginPage({ onLoginSuccess }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [formData, setFormData] = useState({ username: '', password: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const redirectTo = location.state?.from?.pathname || '/admin'

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const result = await loginAdmin(formData)
      onLoginSuccess({
        token: result.accessToken,
        user: result.user,
        expiresInSeconds: result.expiresInSeconds,
      })
      navigate(redirectTo, { replace: true })
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="admin-app">
      <main className="admin-login-shell">
        <section className="admin-login-panel">
          <div className="admin-login-brand">
            <div className="admin-brand-mark" aria-hidden="true">F</div>
            <div className="admin-brand-text">
              <strong>Fortis VN</strong>
              <span>Admin Portal</span>
            </div>
          </div>

          <h1>Đăng nhập quản trị</h1>
          <p className="admin-login-sub">
            Truy cập portal để quản lý RFQ, catalog, nội dung và tài khoản admin.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
            <label className="field">
              <span className="field-label">Username</span>
              <input
                type="text"
                className="field-input"
                value={formData.username}
                placeholder="username"
                onChange={(event) =>
                  setFormData((current) => ({ ...current, username: event.target.value }))
                }
                autoComplete="username"
                required
              />
            </label>

            <label className="field">
              <span className="field-label">Mật khẩu</span>
              <input
                type="password"
                className="field-input"
                value={formData.password}
                placeholder="••••••••"
                onChange={(event) =>
                  setFormData((current) => ({ ...current, password: event.target.value }))
                }
                autoComplete="current-password"
                required
              />
            </label>

            {error ? <div className="alert alert-error">{error}</div> : null}

            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ marginTop: 4 }}>
              {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="admin-login-hint-list">
            <span>admin / Admin@123</span>
            <span>editor / Editor@123</span>
          </div>
        </section>
      </main>
    </div>
  )
}
