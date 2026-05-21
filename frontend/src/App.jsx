import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AdminLayout } from './admin/AdminLayout'
import { AdminRoute } from './components/admin/AdminRoute'
import { SiteLayout } from './layouts/SiteLayout'
import { ContactPage } from './pages/ContactPage'
import { ExportMarketDetailPage } from './pages/ExportMarketDetailPage'
import { ExportMarketPage } from './pages/ExportMarketPage'
import { HomePage } from './pages/HomePage'
import { AdminLoginPage } from './pages/admin/AdminLoginPage'
import { CompanyProfilePage } from './pages/admin/CompanyProfilePage'
import { DashboardPage } from './pages/admin/DashboardPage'
import { ExportMarketAdminPage } from './pages/admin/ExportMarketAdminPage'
import { NavigationMenuAdminPage } from './pages/admin/NavigationMenuAdminPage'
import { ProductCategoryAdminPage } from './pages/admin/ProductCategoryAdminPage'
import { ProductCatalogEditPage } from './pages/admin/ProductCatalogEditPage'
import { ProductCatalogListPage } from './pages/admin/ProductCatalogListPage'
import { RfqManagementPage } from './pages/admin/RfqManagementPage'
import { UserManagementPage } from './pages/admin/UserManagementPage'
import { ProductCatalogPage } from './pages/ProductCatalogPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { loadNavigation, getFallbackNavigation } from './services/navigationApi'
import { fetchCurrentAdminUser } from './services/admin/adminAuthApi'
import {
  clearStoredAdminAuth,
  loadStoredAdminAuth,
  saveStoredAdminAuth,
} from './services/admin/adminAuthStorage'

function App() {
  const [locale, setLocale] = useState('en')
  const [navigation, setNavigation] = useState(() => getFallbackNavigation('en'))
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

  useEffect(() => {
    const controller = new AbortController()

    async function hydrateNavigation() {
      try {
        const result = await loadNavigation(locale, controller.signal)
        setNavigation(result.data)
      } catch (error) {
        if (error.name !== 'AbortError') {
          setNavigation(getFallbackNavigation(locale))
        }
      }
    }

    hydrateNavigation()
    return () => controller.abort()
  }, [locale])

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

  const visibleMenuKeys = new Set((navigation.items ?? []).map((item) => item.key))
  const canAccess = (key) => visibleMenuKeys.has(key)
  const firstVisiblePath = (navigation.items ?? []).find((item) => !item.path.includes('#'))?.path ?? '/'

  function guarded(key, element) {
    return canAccess(key) ? element : <Navigate to={firstVisiblePath} replace />
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
          <Route path="product-categories" element={<ProductCategoryAdminPage />} />
          <Route path="products" element={<ProductCatalogListPage />} />
          <Route path="products/new" element={<ProductCatalogEditPage />} />
          <Route path="products/:productId" element={<ProductCatalogEditPage />} />
          <Route path="export-market" element={<ExportMarketAdminPage />} />
          <Route path="company" element={<CompanyProfilePage />} />
          <Route path="navigation" element={<NavigationMenuAdminPage />} />
          <Route path="users" element={<UserManagementPage />} />
        </Route>

        <Route
          element={<SiteLayout locale={locale} onChangeLocale={setLocale} navigationItems={navigation.items} />}
        >
          <Route index element={guarded('home', <HomePage locale={locale} visibleMenuKeys={visibleMenuKeys} />)} />
          <Route path="/export-market" element={guarded('export-market', <ExportMarketPage locale={locale} />)} />
          <Route path="/export-market/:slug" element={guarded('export-market', <ExportMarketDetailPage locale={locale} />)} />
          <Route path="/products" element={guarded('products', <ProductCatalogPage locale={locale} />)} />
          <Route path="/products/:slug" element={guarded('products', <ProductDetailPage locale={locale} />)} />
          <Route path="/contact" element={<ContactPage locale={locale} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
