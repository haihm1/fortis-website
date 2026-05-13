import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AdminLayout } from './admin/AdminLayout'
import { AdminRoute } from './components/admin/AdminRoute'
import { SiteLayout } from './layouts/SiteLayout'
import { ContactPage } from './pages/ContactPage'
import { HomePage } from './pages/HomePage'
import { AdminLoginPage } from './pages/admin/AdminLoginPage'
import { CompanyProfilePage } from './pages/admin/CompanyProfilePage'
import { DashboardPage } from './pages/admin/DashboardPage'
import { ProductCatalogEditPage } from './pages/admin/ProductCatalogEditPage'
import { ProductCatalogListPage } from './pages/admin/ProductCatalogListPage'
import { RfqManagementPage } from './pages/admin/RfqManagementPage'
import { UserManagementPage } from './pages/admin/UserManagementPage'
import { ProductCatalogPage } from './pages/ProductCatalogPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { fetchCurrentAdminUser } from './services/admin/adminAuthApi'
import {
  clearStoredAdminAuth,
  loadStoredAdminAuth,
  saveStoredAdminAuth,
} from './services/admin/adminAuthStorage'

function App() {
  const [locale, setLocale] = useState('vi')
  const [adminAuth, setAdminAuth] = useState(() => loadStoredAdminAuth())
  const [authBootstrapped, setAuthBootstrapped] = useState(false)

  useEffect(() => {
    const storedAuth = loadStoredAdminAuth()

    if (!storedAuth?.token) {
      setAuthBootstrapped(true)
      return
    }

    async function hydrateAdminSession() {
      try {
        const user = await fetchCurrentAdminUser(storedAuth.token)
        const nextState = { ...storedAuth, user }
        setAdminAuth(nextState)
        saveStoredAdminAuth(nextState)
      } catch {
        clearStoredAdminAuth()
        setAdminAuth(null)
      } finally {
        setAuthBootstrapped(true)
      }
    }

    hydrateAdminSession()
  }, [])

  function handleAdminLogin(authState) {
    setAdminAuth(authState)
    saveStoredAdminAuth(authState)
  }

  function handleAdminLogout() {
    clearStoredAdminAuth()
    setAdminAuth(null)
  }

  if (!authBootstrapped) {
    return null
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/admin/login"
          element={<AdminLoginPage onLoginSuccess={handleAdminLogin} />}
        />
        <Route
          path="/admin"
          element={
            <AdminRoute adminAuth={adminAuth}>
              <AdminLayout adminAuth={adminAuth} onLogout={handleAdminLogout} />
            </AdminRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="rfq" element={<RfqManagementPage />} />
          <Route path="products" element={<ProductCatalogListPage />} />
          <Route path="products/new" element={<ProductCatalogEditPage />} />
          <Route path="products/:productId" element={<ProductCatalogEditPage />} />
          <Route path="company" element={<CompanyProfilePage />} />
          <Route path="users" element={<UserManagementPage />} />
        </Route>

        <Route
          element={<SiteLayout locale={locale} onChangeLocale={setLocale} />}
        >
          <Route index element={<HomePage locale={locale} />} />
          <Route path="/products" element={<ProductCatalogPage locale={locale} />} />
          <Route path="/products/:slug" element={<ProductDetailPage locale={locale} />} />
          <Route path="/contact" element={<ContactPage locale={locale} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
