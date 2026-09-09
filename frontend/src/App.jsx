import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AdminLayout } from './admin/AdminLayout'
import { AdminRoute } from './components/admin/AdminRoute'
import { BrandChooser } from './components/BrandChooser'
import { CharcoalLayout } from './layouts/CharcoalLayout'
import { SiteLayout } from './layouts/SiteLayout'
import { CharcoalContactPage } from './pages/charcoal/CharcoalContactPage'
import { CharcoalHomePage } from './pages/charcoal/CharcoalHomePage'
import { CharcoalProductsPage } from './pages/charcoal/CharcoalProductsPage'
import { BRAND, brandPath, resolveBrand } from './lib/brand'
import { AboutPage } from './pages/AboutPage'
import { ContactPage } from './pages/ContactPage'
import { ExportMarketDetailPage } from './pages/ExportMarketDetailPage'
import { ExportMarketPage } from './pages/ExportMarketPage'
import { HomePage } from './pages/HomePage'
import { AdminLoginPage } from './pages/admin/AdminLoginPage'
import { CompanyProfilePage } from './pages/admin/CompanyProfilePage'
import { CustomerManagementPage } from './pages/admin/CustomerManagementPage'
import { DashboardPage } from './pages/admin/DashboardPage'
import { ExportOrderManagementPage } from './pages/admin/ExportOrderManagementPage'
import { ExportMarketAdminPage } from './pages/admin/ExportMarketAdminPage'
import { NavigationMenuAdminPage } from './pages/admin/NavigationMenuAdminPage'
import { ProductCategoryAdminPage } from './pages/admin/ProductCategoryAdminPage'
import { ProductCatalogEditPage } from './pages/admin/ProductCatalogEditPage'
import { ProductCatalogListPage } from './pages/admin/ProductCatalogListPage'
import { RfqManagementPage } from './pages/admin/RfqManagementPage'
import { UserManagementPage } from './pages/admin/UserManagementPage'
import { ProductCatalogPage } from './pages/ProductCatalogPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { PageLoading } from './components/PageLoading'
import { useBackendData } from './hooks/useBackendData'
import { loadNavigation } from './services/navigationApi'
import { fetchCurrentAdminUser } from './services/admin/adminAuthApi'
import {
  clearStoredAdminAuth,
  loadStoredAdminAuth,
  saveStoredAdminAuth,
} from './services/admin/adminAuthStorage'

const PUBLIC_LOCALES = new Set(['en', 'vi', 'zh'])
const PUBLIC_LOCALE_STORAGE_KEY = 'fortis-public-locale'
const ADMIN_ROUTE_ROLES = {
  dashboard: ['SUPER_ADMIN', 'CONTACT_MANAGER', 'CONTENT_EDITOR', 'CONTENT_PUBLISHER', 'ACCOUNT_MANAGER'],
  rfq: ['SUPER_ADMIN', 'CONTACT_MANAGER'],
  customers: ['SUPER_ADMIN', 'CONTACT_MANAGER'],
  exportOrders: ['SUPER_ADMIN', 'EXPORT_MANAGER', 'CONTACT_MANAGER'],
  products: ['SUPER_ADMIN', 'CONTENT_EDITOR', 'CONTENT_PUBLISHER'],
  productCategories: ['SUPER_ADMIN', 'CONTENT_EDITOR', 'CONTENT_PUBLISHER'],
  exportMarket: ['SUPER_ADMIN', 'CONTENT_EDITOR', 'CONTENT_PUBLISHER'],
  company: ['SUPER_ADMIN', 'CONTENT_EDITOR', 'CONTENT_PUBLISHER'],
  navigation: ['SUPER_ADMIN', 'CONTENT_EDITOR', 'CONTENT_PUBLISHER'],
  users: ['SUPER_ADMIN', 'ACCOUNT_MANAGER'],
}
const ADMIN_ROUTE_ORDER = [
  ['dashboard', 'dashboard'],
  ['rfq', 'rfq'],
  ['customers', 'customers'],
  ['exportOrders', 'export-orders'],
  ['products', 'products'],
  ['productCategories', 'product-categories'],
  ['exportMarket', 'export-market'],
  ['company', 'company'],
  ['navigation', 'navigation'],
  ['users', 'users'],
]

function loadStoredPublicLocale() {
  try {
    const requestedLocale = new URLSearchParams(window.location.search).get('lang')
    if (PUBLIC_LOCALES.has(requestedLocale)) {
      window.localStorage.setItem(PUBLIC_LOCALE_STORAGE_KEY, requestedLocale)
      return requestedLocale
    }

    const value = window.localStorage.getItem(PUBLIC_LOCALE_STORAGE_KEY)
    return PUBLIC_LOCALES.has(value) ? value : 'en'
  } catch {
    return 'en'
  }
}

function App() {
  const [locale, setLocale] = useState(() => loadStoredPublicLocale())
  // Resolved once per load: which of the two sites this hostname/path belongs to.
  const [{ brand, prefix: charcoalPrefix }] = useState(() => resolveBrand())
  /*
   * The charcoal site renders entirely from local content and is served from its
   * own origin, so calling the agricultural navigation API there fails CORS — and
   * useBackendData retries every 4s, so it would fail forever. Skip the request.
   */
  const navigation = useBackendData(
    (signal) =>
      brand === BRAND.CHARCOAL ? Promise.resolve({ items: [] }) : loadNavigation(locale, signal),
    [locale, brand],
  )
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

  function handlePublicLocaleChange(nextLocale) {
    if (!PUBLIC_LOCALES.has(nextLocale)) {
      return
    }
    setLocale(nextLocale)
    try {
      window.localStorage.setItem(PUBLIC_LOCALE_STORAGE_KEY, nextLocale)
      const url = new URL(window.location.href)
      url.searchParams.set('lang', nextLocale)
      window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`)
    } catch {
      // Ignore storage failures; the in-memory state still updates for this session.
    }
  }

  /*
   * The charcoal site renders from hard-coded content, so it must not sit behind the
   * agricultural navigation fetch: gating it there would leave it stuck on a spinner
   * whenever that backend is slow or down, for content that never needed it.
   */
  if (brand === BRAND.CHARCOAL) {
    return (
      <BrowserRouter>
        <Routes>
          <Route
            element={
              <CharcoalLayout
                locale={locale}
                onChangeLocale={handlePublicLocaleChange}
                prefix={charcoalPrefix}
              />
            }
            path={brandPath('/', charcoalPrefix)}
          >
            <Route index element={<CharcoalHomePage locale={locale} prefix={charcoalPrefix} />} />
            <Route
              path={brandPath('/products', charcoalPrefix)}
              element={<CharcoalProductsPage locale={locale} prefix={charcoalPrefix} />}
            />
            <Route
              path={brandPath('/contact', charcoalPrefix)}
              element={<CharcoalContactPage locale={locale} />}
            />
          </Route>
          {/* Any other path on the charcoal host belongs to the agricultural site. */}
          <Route path="*" element={<Navigate to={brandPath('/', charcoalPrefix)} replace />} />
        </Routes>
      </BrowserRouter>
    )
  }

  if (!authBootstrapped || !navigation) {
    return <PageLoading locale={locale} />
  }

  const visibleMenuKeys = new Set((navigation.items ?? []).map((item) => item.key))
  const canAccess = (key) => visibleMenuKeys.has(key)
  const firstVisiblePath = (navigation.items ?? []).find((item) => !item.path.includes('#'))?.path ?? '/'
  const adminRoles = adminAuth?.user?.roles ?? []
  const canAccessAdmin = (roles) => roles.some((role) => adminRoles.includes(role))
  const firstAdminPath =
    ADMIN_ROUTE_ORDER.find(([key]) => canAccessAdmin(ADMIN_ROUTE_ROLES[key]))?.[1] ?? 'dashboard'

  function guarded(key, element) {
    return canAccess(key) ? element : <Navigate to={firstVisiblePath} replace />
  }

  function guardedAdmin(roles, element) {
    return canAccessAdmin(roles) ? element : <Navigate to={`/admin/${firstAdminPath}`} replace />
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
          <Route index element={<Navigate to={firstAdminPath} replace />} />
          <Route path="dashboard" element={guardedAdmin(ADMIN_ROUTE_ROLES.dashboard, <DashboardPage />)} />
          <Route path="rfq" element={guardedAdmin(ADMIN_ROUTE_ROLES.rfq, <RfqManagementPage />)} />
          <Route path="customers" element={guardedAdmin(ADMIN_ROUTE_ROLES.customers, <CustomerManagementPage />)} />
          <Route path="export-orders" element={guardedAdmin(ADMIN_ROUTE_ROLES.exportOrders, <ExportOrderManagementPage />)} />
          <Route path="product-categories" element={guardedAdmin(ADMIN_ROUTE_ROLES.productCategories, <ProductCategoryAdminPage />)} />
          <Route path="products" element={guardedAdmin(ADMIN_ROUTE_ROLES.products, <ProductCatalogListPage />)} />
          <Route path="products/new" element={guardedAdmin(ADMIN_ROUTE_ROLES.products, <ProductCatalogEditPage />)} />
          <Route path="products/:productId" element={guardedAdmin(ADMIN_ROUTE_ROLES.products, <ProductCatalogEditPage />)} />
          <Route path="export-market" element={guardedAdmin(ADMIN_ROUTE_ROLES.exportMarket, <ExportMarketAdminPage />)} />
          <Route path="company" element={guardedAdmin(ADMIN_ROUTE_ROLES.company, <CompanyProfilePage />)} />
          <Route path="navigation" element={guardedAdmin(ADMIN_ROUTE_ROLES.navigation, <NavigationMenuAdminPage />)} />
          <Route path="users" element={guardedAdmin(ADMIN_ROUTE_ROLES.users, <UserManagementPage />)} />
        </Route>

        <Route
          element={<SiteLayout locale={locale} onChangeLocale={handlePublicLocaleChange} navigationItems={navigation.items} />}
        >
          <Route
            index
            element={
              <>
                <BrandChooser locale={locale} />
                {guarded('home', <HomePage locale={locale} visibleMenuKeys={visibleMenuKeys} />)}
              </>
            }
          />
          <Route path="/about" element={guarded('about', <AboutPage locale={locale} />)} />
          <Route path="/export-market" element={guarded('export-market', <ExportMarketPage locale={locale} />)} />
          <Route path="/export-market/:slug" element={guarded('export-market', <ExportMarketDetailPage locale={locale} />)} />
          <Route path="/products" element={guarded('products', <ProductCatalogPage locale={locale} />)} />
          <Route path="/products/:slug" element={guarded('products', <ProductDetailPage locale={locale} />)} />
          <Route path="/contact" element={<ContactPage locale={locale} />} />
        </Route>

        {/* Charcoal pages are also reachable under /charcoal on the main host — that
            is how they are developed locally, and where the brand chooser points when
            the subdomain is not resolvable. A sibling of the SiteLayout route, not a
            child: the charcoal site brings its own header and footer. */}
        <Route
          element={
            <CharcoalLayout locale={locale} onChangeLocale={handlePublicLocaleChange} prefix="/charcoal" />
          }
          path="/charcoal"
        >
          <Route index element={<CharcoalHomePage locale={locale} prefix="/charcoal" />} />
          <Route path="/charcoal/products" element={<CharcoalProductsPage locale={locale} prefix="/charcoal" />} />
          <Route path="/charcoal/contact" element={<CharcoalContactPage locale={locale} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
