import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  IconCatalog,
  IconMail,
  IconPencilCircle,
  IconRfq,
  IconUsers,
} from '../../admin/AdminIcons'
import {
  getAdminAccounts,
  getAdminCatalog,
  getAdminContacts,
} from '../../services/admin/adminApi'

function MiniSparkline({ points, color = 'var(--admin-accent)' }) {
  if (!points || points.length === 0) return null
  const width = 220
  const height = 64
  const max = Math.max(...points, 1)
  const stepX = points.length > 1 ? width / (points.length - 1) : width
  const coords = points.map((value, index) => {
    const x = index * stepX
    const y = height - (value / max) * (height - 8) - 4
    return [x, y]
  })
  const line = coords
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`)
    .join(' ')
  const area = `${line} L ${width} ${height} L 0 ${height} Z`

  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="kpi-chart">
      <defs>
        <linearGradient id="sparkFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#sparkFill)" />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function relativeTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const diff = (Date.now() - date.getTime()) / 1000
  if (diff < 60) return 'Vừa xong'
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} ngày trước`
  return date.toLocaleDateString('vi-VN')
}

export function DashboardPage() {
  const { adminAuth } = useOutletContext()
  const [contacts, setContacts] = useState([])
  const [products, setProducts] = useState([])
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      setError('')
      try {
        const userRoles = adminAuth.user.roles ?? []
        const tasks = []
        if (userRoles.some((r) => ['SUPER_ADMIN', 'CONTACT_MANAGER'].includes(r))) {
          tasks.push(
            getAdminContacts(adminAuth.token)
              .then((data) => {
                if (mounted) setContacts(data.contacts ?? [])
              })
              .catch(() => {}),
          )
        }
        if (userRoles.some((r) => ['SUPER_ADMIN', 'CONTENT_EDITOR', 'CONTENT_PUBLISHER'].includes(r))) {
          tasks.push(
            getAdminCatalog(adminAuth.token)
              .then((data) => {
                if (mounted) setProducts(data.products ?? [])
              })
              .catch(() => {}),
          )
        }
        if (userRoles.some((r) => ['SUPER_ADMIN', 'ACCOUNT_MANAGER'].includes(r))) {
          tasks.push(
            getAdminAccounts(adminAuth.token)
              .then((data) => {
                if (mounted) setAccounts(data.accounts ?? [])
              })
              .catch(() => {}),
          )
        }
        await Promise.all(tasks)
      } catch (err) {
        if (mounted) setError(err.message)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [adminAuth.token, adminAuth.user.roles])

  const stats = useMemo(() => {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 86400 * 1000)
    const newThisWeek = contacts.filter((c) => {
      if (!c.createdAt) return false
      return new Date(c.createdAt) >= weekAgo
    }).length

    const buckets = Array.from({ length: 7 }, () => 0)
    contacts.forEach((c) => {
      if (!c.createdAt) return
      const date = new Date(c.createdAt)
      const diff = Math.floor((now.getTime() - date.getTime()) / 86400000)
      if (diff >= 0 && diff < 7) {
        buckets[6 - diff] += 1
      }
    })

    const productCounts = new Map()
    contacts.forEach((c) => {
      const key = c.productInterest?.trim()
      if (!key) return
      productCounts.set(key, (productCounts.get(key) ?? 0) + 1)
    })
    const topProducts = Array.from(productCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)

    const activeUsers = accounts.filter((a) => a.active).length

    return {
      newThisWeek,
      weeklyBuckets: buckets,
      topProducts,
      totalProducts: products.length,
      activeUsers,
    }
  }, [contacts, products, accounts])

  const recentContacts = useMemo(
    () =>
      [...contacts]
        .sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0))
        .slice(0, 6),
    [contacts],
  )

  return (
    <>
      <header className="admin-page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Tổng quan vận hành Fortis VN — RFQ, catalog và tài khoản.</p>
        </div>
      </header>

      {error ? <div className="alert alert-error">{error}</div> : null}

      <div className="kpi-grid">
        <div className="kpi-card" style={{ gridColumn: 'span 1' }}>
          <div className="kpi-card-label">
            <span>RFQ mới trong tuần</span>
            <span className="kpi-card-icon">
              <IconRfq />
            </span>
          </div>
          <div className="kpi-card-value">{loading ? '—' : stats.newThisWeek}</div>
          <MiniSparkline points={stats.weeklyBuckets} />
        </div>

        <div className="kpi-card">
          <div className="kpi-card-label">
            <span>Tổng sản phẩm</span>
            <span className="kpi-card-icon">
              <IconCatalog />
            </span>
          </div>
          <div className="kpi-card-value">{loading ? '—' : stats.totalProducts}</div>
          <div className="kpi-card-meta">Đang hiển thị trên catalog</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-label">
            <span>Tài khoản đang hoạt động</span>
            <span className="kpi-card-icon">
              <IconUsers />
            </span>
          </div>
          <div className="kpi-card-value">{loading ? '—' : stats.activeUsers}</div>
          <div className="kpi-card-meta">
            {accounts.length ? `${accounts.length} tài khoản toàn hệ thống` : 'Chưa có dữ liệu'}
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-label">
            <span>Sản phẩm được hỏi nhiều</span>
          </div>
          {stats.topProducts.length === 0 ? (
            <div className="kpi-card-meta" style={{ marginTop: 12 }}>
              Chưa có dữ liệu RFQ để xếp hạng.
            </div>
          ) : (
            <ul className="kpi-list">
              {stats.topProducts.map(([name, count]) => (
                <li key={name}>
                  <span>{name}</span>
                  <span>{count} RFQ</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="activity-card">
        <h3>Hoạt động gần đây</h3>
        {recentContacts.length === 0 ? (
          <div style={{ color: '#6a7d75', fontSize: '0.9rem' }}>
            Chưa có liên hệ mới gần đây.
          </div>
        ) : (
          <ul className="activity-list">
            {recentContacts.map((contact) => (
              <li key={contact.id} className="activity-item">
                <span className="activity-icon">
                  <IconMail />
                </span>
                <div className="activity-body">
                  <p>
                    <strong>{contact.fullName}</strong>
                    {contact.companyName ? ` (${contact.companyName})` : ''} gửi yêu cầu về{' '}
                    <strong>{contact.productInterest || 'sản phẩm'}</strong>
                  </p>
                  <small>{relativeTime(contact.createdAt)}</small>
                </div>
              </li>
            ))}
            <li className="activity-item">
              <span className="activity-icon" style={{ background: '#fef3e0', color: '#b9742a' }}>
                <IconPencilCircle />
              </span>
              <div className="activity-body">
                <p>
                  Đăng nhập với vai trò <strong>{adminAuth.user.roles.join(', ')}</strong>
                </p>
                <small>Phiên hiện tại</small>
              </div>
            </li>
          </ul>
        )}
      </div>
    </>
  )
}
