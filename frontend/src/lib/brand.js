/*
 * Which of the two sites this page load belongs to.
 *
 * One codebase and one deploy serve both. In production the charcoal site is a
 * subdomain; locally a subdomain is awkward to set up, so the same pages are also
 * reachable under a /charcoal path prefix. Everything downstream asks for links
 * through brandPath() rather than hard-coding either form.
 */

export const BRAND = {
  AGRI: 'agri',
  CHARCOAL: 'charcoal',
}

/** Production host for the charcoal site. Change here and nowhere else. */
export const CHARCOAL_HOST = 'charcoal.fortisvn.com'

/** Path prefix used when the charcoal site is served from the main host. */
export const CHARCOAL_PATH_PREFIX = '/charcoal'

export const BRAND_CHOICE_STORAGE_KEY = 'fortis:brand-choice'

/** True when `hostname` is the charcoal site's own host. */
export function isCharcoalHost(hostname) {
  if (!hostname) {
    return false
  }
  // `charcoal.localhost` and `charcoal.fortisvn.dev` should behave like the real
  // subdomain, so match the leading label rather than the full string.
  return hostname === CHARCOAL_HOST || hostname.split('.')[0] === 'charcoal'
}

/**
 * Resolves the active brand from the current location.
 *
 * Returns the brand plus the prefix its routes are mounted under: empty on the
 * charcoal host (the site owns the root there) and '/charcoal' when the charcoal
 * pages are being served from the main host.
 */
export function resolveBrand({ hostname, pathname } = {}) {
  const host = hostname ?? (typeof window === 'undefined' ? '' : window.location.hostname)
  const path = pathname ?? (typeof window === 'undefined' ? '/' : window.location.pathname)

  if (isCharcoalHost(host)) {
    return { brand: BRAND.CHARCOAL, prefix: '', onCharcoalHost: true }
  }

  if (path === CHARCOAL_PATH_PREFIX || path.startsWith(`${CHARCOAL_PATH_PREFIX}/`)) {
    return { brand: BRAND.CHARCOAL, prefix: CHARCOAL_PATH_PREFIX, onCharcoalHost: false }
  }

  return { brand: BRAND.AGRI, prefix: '', onCharcoalHost: false }
}

/** Joins a route onto the active prefix: brandPath('/products', '/charcoal'). */
export function brandPath(route, prefix = '') {
  if (!route || route === '/') {
    return prefix || '/'
  }
  return `${prefix}${route}`
}

/**
 * Absolute entry point for the charcoal site, used by the brand chooser and by
 * cross-links in the agri header.
 *
 * On a real deployment this is the subdomain. Anywhere else — localhost, preview
 * builds, an IP address — the subdomain will not resolve, so the path form is
 * returned instead and the link still works.
 */
export function charcoalEntryUrl(hostname = typeof window === 'undefined' ? '' : window.location.hostname) {
  const isDeployedDomain = hostname.endsWith('fortisvn.com')
  return isDeployedDomain ? `https://${CHARCOAL_HOST}/` : CHARCOAL_PATH_PREFIX
}

/** Absolute entry point for the agricultural site, for links from the charcoal side. */
export function agriEntryUrl(hostname = typeof window === 'undefined' ? '' : window.location.hostname) {
  if (isCharcoalHost(hostname) && hostname.endsWith('fortisvn.com')) {
    return 'https://fortisvn.com/'
  }
  return '/'
}
