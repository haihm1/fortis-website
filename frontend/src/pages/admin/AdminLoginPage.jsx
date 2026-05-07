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
    <main className="admin-login-page">
      <section className="admin-login-card">
        <p className="section-eyebrow">Admin Login</p>
        <h1 className="admin-page-title">Đăng nhập quản trị Fortis VN</h1>
        <p className="admin-login-description">
          Sử dụng tài khoản admin để quản lý liên hệ, nội dung và tài khoản cập nhật.
        </p>

        <form className="admin-login-form" onSubmit={handleSubmit}>
          <input
            type="text"
            value={formData.username}
            placeholder="Username"
            onChange={(event) =>
              setFormData((current) => ({ ...current, username: event.target.value }))
            }
          />
          <input
            type="password"
            value={formData.password}
            placeholder="Password"
            onChange={(event) =>
              setFormData((current) => ({ ...current, password: event.target.value }))
            }
          />

          {error ? <p className="form-message error">{error}</p> : null}

          <button type="submit" className="primary-button" disabled={submitting}>
            {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="admin-login-hint">
          <span>admin / Admin@123</span>
          <span>editor / Editor@123</span>
        </div>
      </section>
    </main>
  )
}
