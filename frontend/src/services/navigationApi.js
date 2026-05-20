import { API_BASE_URL } from './apiConfig'

const FALLBACK_ITEMS = [
  { key: 'home', label: 'Home', labelVi: 'Trang chủ', labelEn: 'Home', labelZh: '首页', path: '/', sortOrder: 10, visible: true },
  { key: 'about', label: 'About Us', labelVi: 'About Us', labelEn: 'About Us', labelZh: '关于我们', path: '/#company-profile', sortOrder: 20, visible: true },
  { key: 'services', label: 'Services', labelVi: 'Services', labelEn: 'Services', labelZh: '服务', path: '/#categories', sortOrder: 30, visible: true },
  { key: 'products', label: 'Products', labelVi: 'Sản phẩm', labelEn: 'Products', labelZh: '产品', path: '/products', sortOrder: 40, visible: true },
  { key: 'export-market', label: 'Export Market', labelVi: 'Export Market', labelEn: 'Export Market', labelZh: '出口市场', path: '/export-market', sortOrder: 50, visible: true },
]

function localizeItem(item, locale) {
  const label = locale === 'vi'
    ? item.labelVi
    : locale === 'zh'
      ? item.labelZh || item.labelEn || item.labelVi
      : item.labelEn || item.labelVi
  return { ...item, label }
}

export function getFallbackNavigation(locale = 'en') {
  return {
    locale,
    items: FALLBACK_ITEMS.map((item) => localizeItem(item, locale)),
  }
}

export async function loadNavigation(locale, signal) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/public/navigation?lang=${encodeURIComponent(locale)}`,
      {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal,
      },
    )

    if (!response.ok) {
      throw new Error(`Navigation request failed with status ${response.status}`)
    }

    return { data: await response.json(), source: 'api' }
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error
    }
    return { data: getFallbackNavigation(locale), source: 'fallback' }
  }
}
