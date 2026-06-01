import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  IconBell,
  IconCatalog,
  IconCompany,
  IconDashboard,
  IconHelp,
  IconLogout,
  IconMenu,
  IconNavigation,
  IconRfq,
  IconUsers,
  IconClose,
  IconChart,
} from './AdminIcons'

const NAV_ITEMS = [
  {
    path: '/admin/dashboard',
    label: 'Dashboard',
    icon: IconDashboard,
    roles: ['SUPER_ADMIN', 'CONTACT_MANAGER', 'CONTENT_EDITOR', 'CONTENT_PUBLISHER', 'ACCOUNT_MANAGER'],
  },
  {
    path: '/admin/rfq',
    label: 'RFQ Management',
    icon: IconRfq,
    roles: ['SUPER_ADMIN', 'CONTACT_MANAGER'],
  },
  {
    path: '/admin/customers',
    label: 'Customer Leads',
    icon: IconUsers,
    roles: ['SUPER_ADMIN', 'CONTACT_MANAGER'],
  },
  {
    path: '/admin/products',
    label: 'Product Catalog',
    icon: IconCatalog,
    roles: ['SUPER_ADMIN', 'CONTENT_EDITOR', 'CONTENT_PUBLISHER'],
  },
  {
    path: '/admin/product-categories',
    label: 'Product Categories',
    icon: IconCatalog,
    roles: ['SUPER_ADMIN', 'CONTENT_EDITOR', 'CONTENT_PUBLISHER'],
  },
  {
    path: '/admin/export-market',
    label: 'Export Market',
    icon: IconChart,
    roles: ['SUPER_ADMIN', 'CONTENT_EDITOR', 'CONTENT_PUBLISHER'],
  },
  {
    path: '/admin/company',
    label: 'Company Profile',
    icon: IconCompany,
    roles: ['SUPER_ADMIN', 'CONTENT_EDITOR', 'CONTENT_PUBLISHER'],
  },
  {
    path: '/admin/navigation',
    label: 'Navigation Menu',
    icon: IconNavigation,
    roles: ['SUPER_ADMIN', 'CONTENT_EDITOR', 'CONTENT_PUBLISHER'],
  },
  {
    path: '/admin/users',
    label: 'User Management',
    icon: IconUsers,
    roles: ['SUPER_ADMIN', 'ACCOUNT_MANAGER'],
  },
]

function getInitials(name) {
  if (!name) return 'A'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function AdminLayout({ adminAuth, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!menuOpen) return undefined
    function handleClick(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }
    window.addEventListener('mousedown', handleClick)
    return () => window.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  const userRoles = adminAuth.user.roles ?? []
  const allowedItems = NAV_ITEMS.filter((item) =>
    item.roles.some((role) => userRoles.includes(role)),
  )

  return (
    <div className="admin-app" data-sidebar-open={sidebarOpen ? 'true' : 'false'}>
      <div className="admin-shell">
        <aside className="admin-sidebar" aria-label="Admin navigation">
          <div className="admin-brand">
            <div className="admin-brand-mark" aria-hidden="true">F</div>
            <div className="admin-brand-text">
              <strong>Fortis VN</strong>
              <span>Admin Portal</span>
            </div>
            <button
              type="button"
              className="admin-icon-button"
              onClick={() => setSidebarOpen(false)}
              aria-label="Đóng menu"
              style={{ marginLeft: 'auto' }}
            >
              <IconClose />
            </button>
          </div>

          <nav className="admin-nav">
            {allowedItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => {
                    setSidebarOpen(false)
                    setMenuOpen(false)
                  }}
                  className={({ isActive }) =>
                    `admin-nav-item${isActive ? ' is-active' : ''}`
                  }
                >
                  <span className="admin-nav-icon" aria-hidden="true">
                    <Icon />
                  </span>
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
          </nav>
        </aside>

        <div className="admin-main">
          <header className="admin-topbar">
            <div className="admin-topbar-left">
              <button
                type="button"
                className="admin-icon-button"
                onClick={() => setSidebarOpen((current) => !current)}
                aria-label="Mở menu điều hướng"
                aria-expanded={sidebarOpen}
              >
                <IconMenu />
              </button>
            </div>

            <div className="admin-topbar-actions">
              <button type="button" className="admin-icon-button" aria-label="Thông báo">
                <IconBell />
              </button>
              <button type="button" className="admin-icon-button" aria-label="Trợ giúp">
                <IconHelp />
              </button>

              <div ref={menuRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  className="admin-avatar"
                  onClick={() => setMenuOpen((current) => !current)}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                >
                  <span className="admin-avatar-bubble" aria-hidden="true">
                    {getInitials(adminAuth.user.displayName)}
                  </span>
                  <span className="admin-avatar-name">
                    <strong>{adminAuth.user.displayName}</strong>
                    <span>{adminAuth.user.roles?.[0] ?? 'Admin'}</span>
                  </span>
                </button>

                {menuOpen ? (
                  <div className="admin-menu-popover" role="menu">
                    <div style={{ padding: '8px 12px' }}>
                      <strong style={{ fontSize: '0.92rem' }}>
                        {adminAuth.user.displayName}
                      </strong>
                      <div style={{ color: 'var(--admin-text-soft)', fontSize: '0.78rem' }}>
                        {adminAuth.user.email}
                      </div>
                    </div>
                    <div className="admin-menu-divider" />
                    <button type="button" onClick={onLogout}>
                      <IconLogout style={{ width: 16, height: 16, marginRight: 8, verticalAlign: 'middle' }} />
                      Đăng xuất
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </header>

          <main className="admin-content">
            <Outlet context={{ adminAuth, onLogout }} />
          </main>
        </div>
      </div>
    </div>
  )
}
