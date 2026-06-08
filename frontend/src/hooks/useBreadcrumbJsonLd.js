import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { buildBreadcrumbSchema } from '../data/seoConfig'
import { useJsonLd } from './useJsonLd'

const FALLBACK_LABELS = {
  vi: {
    home: 'Trang chủ',
    products: 'Sản phẩm',
    exportMarket: 'Thị trường xuất khẩu',
    contact: 'Liên hệ',
  },
  en: {
    home: 'Home',
    products: 'Products',
    exportMarket: 'Export market',
    contact: 'Contact',
  },
  zh: {
    home: '首页',
    products: '产品',
    exportMarket: '出口市场',
    contact: '联系我们',
  },
}

function titleFromSlug(slug) {
  return decodeURIComponent(slug ?? '')
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function findNavigationLabel(navigationItems, key, fallback) {
  return navigationItems.find((item) => item.key === key)?.label ?? fallback
}

function buildItems(pathname, locale, navigationItems) {
  const labels = FALLBACK_LABELS[locale] ?? FALLBACK_LABELS.en
  const normalizedPath = pathname === '/' ? '/' : pathname.replace(/\/+$/, '')
  const segments = normalizedPath.split('/').filter(Boolean)
  const items = [{ name: labels.home, path: '/' }]

  if (segments.length === 0) {
    return items
  }

  if (segments[0] === 'products') {
    items.push({
      name: findNavigationLabel(navigationItems, 'products', labels.products),
      path: '/products',
    })

    if (segments[1]) {
      items.push({ name: titleFromSlug(segments[1]), path: `/products/${segments[1]}` })
    }

    return items
  }

  if (segments[0] === 'export-market') {
    items.push({
      name: findNavigationLabel(navigationItems, 'export-market', labels.exportMarket),
      path: '/export-market',
    })

    if (segments[1]) {
      items.push({ name: titleFromSlug(segments[1]), path: `/export-market/${segments[1]}` })
    }

    return items
  }

  if (segments[0] === 'contact') {
    items.push({ name: labels.contact, path: '/contact' })
    return items
  }

  items.push({ name: titleFromSlug(segments.at(-1)), path: normalizedPath })
  return items
}

export function useBreadcrumbJsonLd({ locale = 'en', navigationItems = [] } = {}) {
  const location = useLocation()
  const schema = useMemo(
    () => buildBreadcrumbSchema(buildItems(location.pathname, locale, navigationItems)),
    [location.pathname, locale, navigationItems],
  )

  useJsonLd('site-breadcrumb', schema)
}

