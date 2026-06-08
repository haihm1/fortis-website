import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getFallbackProductCatalog } from '../src/data/productCatalogFallback.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const distDir = path.join(projectRoot, 'dist')
const templatePath = path.join(distDir, 'index.html')

const SITE_URL = stripTrailingSlash(process.env.VITE_SITE_URL || 'https://fortisvn.com')
const API_BASE_URL = stripTrailingSlash(process.env.PRERENDER_API_BASE_URL || process.env.VITE_API_BASE_URL || '')
const SITE_TITLE = 'Fortis VN'
const MAX_TITLE_LENGTH = 60

const STATIC_ROUTES = [
  {
    path: '/',
    title: 'Vietnamese Agricultural Export Solutions',
    description:
      'Fortis VN supplies Vietnamese agricultural products for global B2B buyers with transparent sourcing, stable delivery and export documentation support.',
    html: renderHomeHtml(),
  },
]

async function main() {
  const template = await readFile(templatePath, 'utf8')
  const catalog = await loadCatalog()
  const routes = [
    ...STATIC_ROUTES,
    buildProductsRoute(catalog),
    ...catalog.products.map((product) => buildProductRoute(product)),
  ]

  for (const route of routes) {
    await writeRoute(template, route)
  }

  console.log(`[prerender-seo] Generated ${routes.length} static HTML route(s).`)
}

async function loadCatalog() {
  if (API_BASE_URL) {
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
      console.warn(`[prerender-seo] Catalog API unavailable, using fallback catalog. ${error.message}`)
    }
  } else {
    console.warn('[prerender-seo] VITE_API_BASE_URL is not set, using fallback catalog.')
  }

  return normalizeCatalog(getFallbackProductCatalog('en'))
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
      name: product.name || 'Fortis VN product',
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
      'Browse Fortis VN export products, HS codes, packing specifications and B2B sourcing options for Vietnamese agricultural goods.',
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

function renderHomeHtml() {
  return `
    <main class="seo-prerender-page">
      <h1>Fortis VN connects Vietnamese produce with global markets.</h1>
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
  const outputPath = route.path === '/'
    ? path.join(distDir, 'index.html')
    : path.join(distDir, route.path.replace(/^\/+/, ''), 'index.html')

  await mkdir(path.dirname(outputPath), { recursive: true })
  await writeFile(outputPath, html, 'utf8')
}

function renderHtml(template, route) {
  const fullTitle = formatTitle(route.title)
  const canonicalUrl = `${SITE_URL}${route.path}`
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
    `<style>
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
      .seo-prerender-page dd{margin:0;text-align:right}
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
    'Contact Fortis VN for export sourcing and quotation.',
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
