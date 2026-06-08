import { useEffect } from 'react'

const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://fortisvn.com'
const SITE_TITLE = 'Fortis VN'
const TITLE_SEPARATOR = ' | '
const MAX_TITLE_LENGTH = 60
const HREFLANG_LOCALES = ['vi', 'en', 'zh']

function upsertMeta(selector, attrs) {
  let el = document.head.querySelector(selector)
  if (!el) {
    el = document.createElement('meta')
    document.head.appendChild(el)
  }
  for (const [key, value] of Object.entries(attrs)) {
    el.setAttribute(key, value)
  }
  return el
}

function upsertLink(rel, attrs = {}) {
  let el = document.head.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  for (const [key, value] of Object.entries(attrs)) {
    el.setAttribute(key, value)
  }
  return el
}

function upsertAlternateLink(hreflang, href) {
  let el = document.head.querySelector(`link[rel="alternate"][hreflang="${hreflang}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'alternate')
    el.setAttribute('data-managed-by', 'useSeoMeta')
    document.head.appendChild(el)
  }

  el.setAttribute('hreflang', hreflang)
  el.setAttribute('href', href)
  return el
}

function buildLocalizedUrl(path, locale) {
  const url = new URL(path || '/', SITE_URL)
  url.searchParams.set('lang', locale)
  return url.toString()
}

function truncateTitle(value, maxLength) {
  if (value.length <= maxLength) {
    return value
  }

  return `${value.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`
}

function formatTitle(title) {
  const pageTitle = String(title ?? '').trim()

  if (!pageTitle) {
    return SITE_TITLE
  }

  if (pageTitle === SITE_TITLE || pageTitle.endsWith(`${TITLE_SEPARATOR}${SITE_TITLE}`)) {
    return truncateTitle(pageTitle, MAX_TITLE_LENGTH)
  }

  const suffix = `${TITLE_SEPARATOR}${SITE_TITLE}`
  const maxPageTitleLength = MAX_TITLE_LENGTH - suffix.length
  const clippedPageTitle = truncateTitle(pageTitle, maxPageTitleLength)
  return `${clippedPageTitle}${suffix}`
}

/**
 * @param {object} meta
 * @param {string} meta.title
 * @param {string} meta.description
 * @param {string} [meta.path]
 * @param {string} [meta.type]
 * @param {string} [meta.image]
 * @param {string} [meta.locale]
 * @param {boolean} [meta.noindex]
 */
export function useSeoMeta({ title, description, path = '', type = 'website', image, locale = 'vi', noindex = false }) {
  useEffect(() => {
    const fullTitle = formatTitle(title)
    const canonicalUrl = `${SITE_URL}${path}`
    const ogImage = image ?? 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80'
    const ogLocale = locale === 'vi' ? 'vi_VN' : locale === 'zh' ? 'zh_CN' : 'en_US'

    document.title = fullTitle

    upsertMeta('meta[name="description"]', { name: 'description', content: description })
    upsertMeta('meta[name="robots"]', {
      name: 'robots',
      content: noindex ? 'noindex, nofollow' : 'index, follow',
    })
    upsertLink('canonical', { href: canonicalUrl })
    HREFLANG_LOCALES.forEach((hreflang) => {
      upsertAlternateLink(hreflang, buildLocalizedUrl(path, hreflang))
    })
    upsertAlternateLink('x-default', buildLocalizedUrl(path, 'en'))

    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: type })
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: fullTitle })
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description })
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl })
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: ogImage })
    upsertMeta('meta[property="og:locale"]', { property: 'og:locale', content: ogLocale })
    upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: SITE_TITLE })

    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' })
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: fullTitle })
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description })
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: ogImage })
  }, [title, description, path, type, image, locale, noindex])
}
