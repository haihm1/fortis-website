/*
 * Edge entry in front of the static assets.
 *
 * The build produces one set of files, but two sites are served from them: the
 * agricultural site on fortisvn.com and the charcoal site on its subdomain (and,
 * as a dev/fallback path, under /charcoal on the main host). Static HTML cannot
 * vary by hostname on its own, so without this the charcoal host would hand out
 * the agricultural title, description and og:image to anything that does not run
 * JavaScript — link previews on Facebook, Zalo and LinkedIn in particular.
 *
 * For charcoal requests this swaps in the charcoal variant that prerender-seo.mjs
 * writes under dist/__charcoal/. Everything else — the whole agricultural site,
 * and every static file on either host — passes straight through to the asset
 * handler untouched. wrangler.jsonc limits which paths reach this worker at all,
 * so agricultural pages other than the few whose paths collide with charcoal
 * routes never pay for the hostname check.
 */
import { CHARCOAL_PATH_PREFIX, CHARCOAL_PRERENDER_DIR, isCharcoalHost } from '../src/lib/brand.js'

/** Charcoal routes that have a prerendered file. '' is the home page. */
const CHARCOAL_PAGES = new Set(['', 'products', 'contact'])

const PRERENDER_PREFIX = `/${CHARCOAL_PRERENDER_DIR}`

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    // The prerendered variants exist only to be swapped in below. Serving them at
    // their real path would index a second copy of every charcoal page.
    if (url.pathname === PRERENDER_PREFIX || url.pathname.startsWith(`${PRERENDER_PREFIX}/`)) {
      return new Response('Not found', { status: 404 })
    }

    const onCharcoalHost = isCharcoalHost(url.hostname)
    const onCharcoalPath =
      url.pathname === CHARCOAL_PATH_PREFIX || url.pathname.startsWith(`${CHARCOAL_PATH_PREFIX}/`)

    if ((!onCharcoalHost && !onCharcoalPath) || (request.method !== 'GET' && request.method !== 'HEAD')) {
      return env.ASSETS.fetch(request)
    }

    // Normalise to the route segment: "/charcoal/products/" -> "products", "/" -> "".
    let pathname = onCharcoalPath ? url.pathname.slice(CHARCOAL_PATH_PREFIX.length) || '/' : url.pathname
    pathname = pathname.replace(/\/index\.html$/, '').replace(/\/+$/, '')
    const segment = pathname.replace(/^\//, '')

    // A dot means a real file (robots.txt, company-profile.pdf, favicon) — not a
    // page. Let the asset handler serve it exactly as it would on the main host.
    if (segment.includes('.')) {
      return env.ASSETS.fetch(request)
    }

    // Unknown charcoal routes get the home shell, mirroring the SPA fallback; the
    // client router then redirects them to the charcoal root.
    const page = CHARCOAL_PAGES.has(segment) ? segment : ''
    const target = new URL(`${PRERENDER_PREFIX}/${page ? `${page}/` : ''}index.html`, url.origin)

    return env.ASSETS.fetch(new Request(target, request))
  },
}
