import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { CHARCOAL_CONTENT } from '../src/data/charcoalContent.js'
import { CHARCOAL_MEDIA } from '../src/data/charcoalMedia.js'
import { COMPANY_CONTACT } from '../src/data/companyContact.js'
import { CHARCOAL_HOST, CHARCOAL_PRERENDER_DIR } from '../src/lib/brand.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const distDir = path.join(projectRoot, 'dist')
const templatePath = path.join(distDir, 'index.html')

const SITE_URL = stripTrailingSlash(process.env.VITE_SITE_URL || 'https://fortisvn.com')
const CHARCOAL_SITE_URL = stripTrailingSlash(process.env.VITE_CHARCOAL_SITE_URL || `https://${CHARCOAL_HOST}`)
const API_BASE_URL = stripTrailingSlash(process.env.PRERENDER_API_BASE_URL || process.env.VITE_API_BASE_URL || '')
const SITE_TITLE = 'FortisVN'
const MAX_TITLE_LENGTH = 60

const STATIC_ROUTES = [
  {
    path: '/',
    title: 'Vietnamese Agricultural Export Solutions',
    description:
      'FortisVN supplies Vietnamese agricultural products for global B2B buyers with transparent sourcing, stable delivery and export documentation support.',
    html: renderHomeHtml(),
  },
]

/*
 * Titles and descriptions for the charcoal site. These mirror SEO.charcoal* in
 * src/data/seoConfig.js, which cannot be imported here because it reads
 * import.meta.env at module scope (Vite-only). The agricultural home route above
 * is duplicated the same way for the same reason. Keep the two in step by hand.
 */
const CHARCOAL_SEO = {
  home: {
    title: 'Pressed Sawdust & BBQ Charcoal Export',
    description:
      'FortisVN supplies pressed sawdust briquettes, white charcoal and coconut shell charcoal to industrial buyers, restaurants and importers worldwide. OEM and market-specific packing available.',
  },
  products: {
    title: 'Charcoal Products – Sawdust, White & Coconut',
    description:
      'FortisVN charcoal range: hexagonal and square sawdust briquettes, Binchotan white charcoal and coconut shell charcoal. Technical specifications issued with each quotation.',
  },
  contact: {
    title: 'Charcoal Enquiries & Quotations',
    description:
      'Contact the FortisVN export team for quotations and samples of sawdust briquettes, white charcoal and coconut shell charcoal.',
  },
}

async function main() {
  // Read the Vite output before any route overwrites dist/index.html: every
  // variant, agricultural or charcoal, must carry the same hashed script tags.
  const template = await readFile(templatePath, 'utf8')
  const catalog = await loadCatalog()
  const routes = [
    ...STATIC_ROUTES,
    ...(catalog
      ? [buildProductsRoute(catalog), ...catalog.products.map((product) => buildProductRoute(product))]
      : []),
    ...buildCharcoalRoutes(),
  ]

  for (const route of routes) {
    await writeRoute(template, route)
  }

  if (!catalog) {
    console.warn('[prerender-seo] Backend catalog unavailable — skipped product SEO routes for this build.')
  }

  console.log(`[prerender-seo] Generated ${routes.length} static HTML route(s).`)
}

async function loadCatalog() {
  if (!API_BASE_URL) {
    console.warn('[prerender-seo] VITE_API_BASE_URL is not set, skipping product SEO routes.')
    return null
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/public/catalog?lang=en`, {
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) {
      throw new Error(`Catalog API returned ${response.status}`)
    }

    const data = await response.json()
    return normalizeCatalog(data)
  } catch (error) {
    console.warn(`[prerender-seo] Catalog API unavailable, skipping product SEO routes. ${error.message}`)
    return null
  }
}

function normalizeCatalog(data) {
  const categories = Array.isArray(data.categories) ? data.categories : []
  const products = (Array.isArray(data.products) ? data.products : []).map((product) => {
    const specifications = normalizeSpecs(product.specifications)
    const categoryName =
      product.categoryName ||
      categories.find((category) => category.id === product.categoryId)?.name ||
      ''

    return {
      ...product,
      categoryName,
      name: product.name || 'FortisVN product',
      summary: product.summary || '',
      slug: product.slug,
      image: product.image || product.gallery?.[0] || '',
      hsCode: product.hsCode || '',
      packagingSpec: product.packagingSpec || specifications[0]?.value || '',
      specifications,
      applications: Array.isArray(product.applications) ? product.applications.filter(Boolean) : [],
    }
  }).filter((product) => product.slug)

  return { ...data, categories, products }
}

function normalizeSpecs(specifications) {
  if (!Array.isArray(specifications)) {
    return []
  }

  return specifications
    .filter((spec) => spec?.label && spec?.value)
    .map((spec) => ({ label: spec.label, value: spec.value }))
}

function buildProductsRoute(catalog) {
  const productItems = catalog.products
    .map((product) => `
      <article class="seo-product-card">
        ${product.image ? `<img src="${escapeAttr(product.image)}" alt="${escapeAttr(product.name)}" loading="lazy" decoding="async" />` : ''}
        <h2><a href="/products/${escapeAttr(product.slug)}">${escapeHtml(product.name)}</a></h2>
        <p>${escapeHtml(product.summary)}</p>
        ${renderSpecList([
          product.hsCode ? ['HS Code', product.hsCode] : null,
          product.packagingSpec ? ['Packaging', product.packagingSpec] : null,
        ])}
      </article>
    `)
    .join('')

  return {
    path: '/products',
    title: 'Export Product Catalog',
    description:
      'Browse FortisVN export products, HS codes, packing specifications and B2B sourcing options for Vietnamese agricultural goods.',
    html: `
      <main class="seo-prerender-page">
        <nav><a href="/">Home</a> / <span>Products</span></nav>
        <h1>Export Product Catalog</h1>
        <p>Vietnamese agricultural products for international importers, distributors and food industry buyers.</p>
        <section class="seo-product-grid">${productItems}</section>
      </main>
    `,
  }
}

function buildProductRoute(product) {
  const specs = [
    product.hsCode ? ['HS Code', product.hsCode] : null,
    product.packagingSpec ? ['Packaging specification', product.packagingSpec] : null,
    ...product.specifications.map((spec) => [spec.label, spec.value]),
  ]

  return {
    path: `/products/${product.slug}`,
    title: product.name,
    description: buildProductDescription(product),
    image: product.image,
    html: `
      <main class="seo-prerender-page seo-product-detail">
        <nav><a href="/">Home</a> / <a href="/products">Products</a> / <span>${escapeHtml(product.name)}</span></nav>
        <article>
          <p>${escapeHtml(product.categoryName)}</p>
          <h1>${escapeHtml(product.name)}</h1>
          <p>${escapeHtml(product.summary)}</p>
          ${product.image ? `<img src="${escapeAttr(product.image)}" alt="${escapeAttr(product.name)}" loading="eager" decoding="async" />` : ''}
          <section>
            <h2>Technical specifications</h2>
            ${renderSpecList(specs)}
          </section>
          ${renderListSection('Markets / channels', product.applications)}
        </article>
      </main>
    `,
  }
}

/*
 * Charcoal variants. They are written under dist/__charcoal/ rather than at
 * their real paths because those paths ("/", "/products", "/contact") are
 * already taken by the agricultural site; worker/index.js swaps them in when
 * the request arrives on the charcoal host. Canonical and og:url point at the
 * charcoal subdomain so the /charcoal fallback path on the main host
 * consolidates onto it instead of competing with it.
 */
function buildCharcoalRoutes() {
  const copy = CHARCOAL_CONTENT.en
  const shared = {
    siteUrl: CHARCOAL_SITE_URL,
    image: CHARCOAL_MEDIA.heroEmber,
    style: CHARCOAL_STYLE,
  }

  return [
    {
      ...shared,
      path: '/',
      outputPath: path.join(distDir, CHARCOAL_PRERENDER_DIR, 'index.html'),
      title: CHARCOAL_SEO.home.title,
      description: CHARCOAL_SEO.home.description,
      html: `
        <main class="seo-prerender-page seo-charcoal">
          <p>${escapeHtml(copy.hero.slides[0].eyebrow)}</p>
          <h1>${escapeHtml(copy.hero.slides[0].title)}</h1>
          <p>${escapeHtml(copy.hero.slides[0].description)}</p>
          <section>
            <h2>${escapeHtml(copy.intro.title)}</h2>
            ${copy.intro.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}
          </section>
          <section>
            <h2>${escapeHtml(copy.products.title)}</h2>
            <ul>${copy.products.items.map((item) => `<li><a href="/products">${escapeHtml(item.name)}</a></li>`).join('')}</ul>
          </section>
          <section>
            <h2>${escapeHtml(copy.markets.title)}</h2>
            <ul>${copy.markets.items.map((market) => `<li>${escapeHtml(market)}</li>`).join('')}</ul>
          </section>
        </main>
      `,
    },
    {
      ...shared,
      path: '/products',
      outputPath: path.join(distDir, CHARCOAL_PRERENDER_DIR, 'products', 'index.html'),
      title: CHARCOAL_SEO.products.title,
      description: CHARCOAL_SEO.products.description,
      html: `
        <main class="seo-prerender-page seo-charcoal">
          <nav><a href="/">Home</a> / <span>Products</span></nav>
          <h1>${escapeHtml(copy.products.title)}</h1>
          <p>${escapeHtml(copy.products.description)}</p>
          <section class="seo-product-grid">
            ${copy.products.items.map((item) => `
              <article class="seo-product-card">
                <h2>${escapeHtml(item.name)}</h2>
                <p>${escapeHtml(item.summary)}</p>
                <ul>${item.attributes.map((attribute) => `<li>${escapeHtml(attribute)}</li>`).join('')}</ul>
              </article>
            `).join('')}
          </section>
        </main>
      `,
    },
    {
      ...shared,
      path: '/contact',
      outputPath: path.join(distDir, CHARCOAL_PRERENDER_DIR, 'contact', 'index.html'),
      title: CHARCOAL_SEO.contact.title,
      description: CHARCOAL_SEO.contact.description,
      html: `
        <main class="seo-prerender-page seo-charcoal">
          <nav><a href="/">Home</a> / <span>Contact</span></nav>
          <h1>${escapeHtml(copy.contact.title)}</h1>
          <p>${escapeHtml(copy.cta.description)}</p>
          ${renderSpecList([
            [copy.contact.labels.address, COMPANY_CONTACT.addressEn],
            [copy.contact.labels.hotline, COMPANY_CONTACT.hotlineDisplay],
            [copy.contact.labels.email, COMPANY_CONTACT.email],
          ])}
        </main>
      `,
    },
  ]
}

function renderHomeHtml() {
  return `
    <main class="seo-prerender-page">
      <h1>FortisVN connects Vietnamese produce with global markets.</h1>
      <p>Export-focused Vietnamese agricultural product supply partner for global buyers.</p>
      <section>
        <h2>Agricultural, forest and seafood exports</h2>
        <p>Transparent sourcing, stable delivery and flexible B2B support for international buyers.</p>
      </section>
    </main>
  `
}

function renderSpecList(specs) {
  const items = specs.filter(Boolean)
  if (items.length === 0) {
    return ''
  }

  return `
    <dl>
      ${items.map(([label, value]) => `
        <div>
          <dt>${escapeHtml(label)}</dt>
          <dd>${escapeHtml(value)}</dd>
        </div>
      `).join('')}
    </dl>
  `
}

function renderListSection(title, items) {
  if (!Array.isArray(items) || items.length === 0) {
    return ''
  }

  return `
    <section>
      <h2>${escapeHtml(title)}</h2>
      <ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
    </section>
  `
}

async function writeRoute(template, route) {
  const html = renderHtml(template, route)
  const outputPath = route.outputPath
    ?? (route.path === '/'
      ? path.join(distDir, 'index.html')
      : path.join(distDir, route.path.replace(/^\/+/, ''), 'index.html'))

  await mkdir(path.dirname(outputPath), { recursive: true })
  await writeFile(outputPath, html, 'utf8')
}

const AGRI_STYLE = `
      .seo-prerender-page{font-family:Inter,Arial,sans-serif;max-width:1120px;margin:0 auto;padding:96px 24px 48px;color:#12391c}
      .seo-prerender-page h1{font-size:clamp(2rem,4vw,4rem);line-height:1.05;margin:0 0 18px}
      .seo-prerender-page h2{font-size:1.25rem;margin:24px 0 12px}
      .seo-prerender-page p{line-height:1.7;color:#53635a}
      .seo-product-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;margin-top:28px}
      .seo-product-card{border:1px solid #dfe8d7;padding:18px}
      .seo-product-card img,.seo-product-detail img{width:100%;aspect-ratio:4/3;object-fit:cover;margin-bottom:14px}
      .seo-prerender-page dl{display:grid;gap:8px}
      .seo-prerender-page dl div{display:flex;justify-content:space-between;gap:16px;border-bottom:1px solid #dfe8d7;padding-bottom:8px}
      .seo-prerender-page dt{font-weight:700;color:#1b5929}
      .seo-prerender-page dd{margin:0;text-align:right}`

/* Same skeleton in the charcoal palette, so a no-JS visitor sees the right site. */
const CHARCOAL_STYLE = `
      body{background:#0d0c0b}
      .seo-prerender-page{font-family:Inter,Arial,sans-serif;max-width:1120px;margin:0 auto;padding:96px 24px 48px;color:#f6f6f5}
      .seo-prerender-page h1{font-size:clamp(2rem,4vw,4rem);line-height:1.05;margin:0 0 18px}
      .seo-prerender-page h2{font-size:1.25rem;margin:24px 0 12px}
      .seo-prerender-page p,.seo-prerender-page li{line-height:1.7;color:#c9c7c3}
      .seo-prerender-page a{color:#eba76e}
      .seo-product-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;margin-top:28px}
      .seo-product-card{border:1px solid #35322d;padding:18px}
      .seo-prerender-page dl{display:grid;gap:8px}
      .seo-prerender-page dl div{display:flex;justify-content:space-between;gap:16px;border-bottom:1px solid #35322d;padding-bottom:8px}
      .seo-prerender-page dt{font-weight:700;color:#e2823f}
      .seo-prerender-page dd{margin:0;text-align:right}`

function renderHtml(template, route) {
  const fullTitle = formatTitle(route.title)
  const siteUrl = route.siteUrl ?? SITE_URL
  const canonicalUrl = `${siteUrl}${route.path === '/' ? '/' : route.path}`
  const meta = [
    `<title>${escapeHtml(fullTitle)}</title>`,
    `<meta name="description" content="${escapeAttr(route.description)}" />`,
    `<link rel="canonical" href="${escapeAttr(canonicalUrl)}" />`,
    `<link rel="alternate" hreflang="en" href="${escapeAttr(`${canonicalUrl}?lang=en`)}" />`,
    `<link rel="alternate" hreflang="vi" href="${escapeAttr(`${canonicalUrl}?lang=vi`)}" />`,
    `<link rel="alternate" hreflang="zh" href="${escapeAttr(`${canonicalUrl}?lang=zh`)}" />`,
    `<link rel="alternate" hreflang="x-default" href="${escapeAttr(`${canonicalUrl}?lang=en`)}" />`,
    `<meta property="og:title" content="${escapeAttr(fullTitle)}" />`,
    `<meta property="og:description" content="${escapeAttr(route.description)}" />`,
    `<meta property="og:url" content="${escapeAttr(canonicalUrl)}" />`,
    route.image ? `<meta property="og:image" content="${escapeAttr(route.image)}" />` : '',
    `<meta name="twitter:title" content="${escapeAttr(fullTitle)}" />`,
    `<meta name="twitter:description" content="${escapeAttr(route.description)}" />`,
    route.image ? `<meta name="twitter:image" content="${escapeAttr(route.image)}" />` : '',
    `<style>${route.style ?? AGRI_STYLE}
    </style>`,
  ].filter(Boolean).join('\n    ')

  return template
    .replace(/<html\s+lang=["'][^"']*["']/i, '<html lang="en"')
    .replace(/<title>[\s\S]*?<\/title>/i, '')
    .replace(/<meta\s+name=["']description["'][^>]*>\s*/i, '')
    .replace(/<meta\s+property=["']og:title["'][^>]*>\s*/gi, '')
    .replace(/<meta\s+property=["']og:description["'][^>]*>\s*/gi, '')
    .replace(/<meta\s+property=["']og:url["'][^>]*>\s*/gi, '')
    .replace(/<meta\s+property=["']og:image["'][^>]*>\s*/gi, '')
    .replace(/<meta\s+name=["']twitter:title["'][^>]*>\s*/gi, '')
    .replace(/<meta\s+name=["']twitter:description["'][^>]*>\s*/gi, '')
    .replace(/<meta\s+name=["']twitter:image["'][^>]*>\s*/gi, '')
    .replace(/<link\s+rel=["']canonical["'][^>]*>\s*/gi, '')
    .replace(/<link\s+rel=["']alternate["'][^>]*>\s*/gi, '')
    .replace('</head>', `    ${meta}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${route.html}</div>`)
}

function buildProductDescription(product) {
  const parts = [
    product.summary,
    product.hsCode ? `HS Code: ${product.hsCode}` : '',
    product.packagingSpec ? `Packing: ${product.packagingSpec}` : '',
    'Contact FortisVN for export sourcing and quotation.',
  ].filter(Boolean)

  return parts.join(' ')
}

function formatTitle(title) {
  const suffix = ` | ${SITE_TITLE}`
  const value = title ? String(title).trim() : SITE_TITLE
  if (value === SITE_TITLE || value.endsWith(suffix)) {
    return truncate(value, MAX_TITLE_LENGTH)
  }

  return `${truncate(value, MAX_TITLE_LENGTH - suffix.length)}${suffix}`
}

function truncate(value, maxLength) {
  if (value.length <= maxLength) {
    return value
  }

  return `${value.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`
}

function stripTrailingSlash(value) {
  return String(value || '').replace(/\/+$/, '')
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function escapeAttr(value) {
  return escapeHtml(value)
}

main().catch((error) => {
  console.error('[prerender-seo] Failed to generate static HTML routes.')
  console.error(error)
  process.exitCode = 1
})
