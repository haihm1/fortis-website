import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PageLoading } from '../components/PageLoading'
import { SectionHeading } from '../components/SectionHeading'
import { useBackendData } from '../hooks/useBackendData'
import { useJsonLd } from '../hooks/useJsonLd'
import { useSeoMeta } from '../hooks/useSeoMeta'
import { SEO, buildProductSeo, buildProductSchema } from '../data/seoConfig'
import { loadProductCatalog } from '../services/productCatalogApi'

const DETAIL_COPY = {
  vi: {
    notFoundDescription: 'Sản phẩm này không tồn tại hoặc đã bị gỡ khỏi catalog.',
    backToCatalog: 'Quay lại',
    downloadSpec: 'Tải file kỹ thuật',
    quote: 'Nhận báo giá',
    gallery: 'Gallery sản phẩm',
    detailDescription: 'Mô tả chi tiết',
    highlights: 'Điểm nổi bật',
    qualityControl: 'Quy trình kiểm soát chất lượng',
    applications: 'Thị trường / kênh tiêu thụ',
    technicalSpecs: 'Thông số kỹ thuật',
    hsCode: 'Mã HS',
    packagingSpec: 'Quy cách đóng gói',
    relatedProducts: 'Sản phẩm liên quan',
    relatedDescription: 'Các sản phẩm cùng nhóm để buyer so sánh nhanh trước khi gửi RFQ.',
    notFound: 'Không tìm thấy sản phẩm theo đường dẫn này.',
    breadcrumbProducts: 'Sản phẩm',
    viewDetail: 'Xem chi tiết',
  },
  en: {
    notFoundDescription: 'This product does not exist or has been removed from the catalog.',
    backToCatalog: 'Back',
    downloadSpec: 'Download spec sheet',
    quote: 'Get a quote',
    gallery: 'Product gallery',
    detailDescription: 'Detailed description',
    highlights: 'Highlights',
    qualityControl: 'Quality control process',
    applications: 'Markets / channels',
    technicalSpecs: 'Technical specifications',
    hsCode: 'HS Code',
    packagingSpec: 'Packaging specification',
    relatedProducts: 'Related products',
    relatedDescription:
      'Products from the same category so buyers can compare before sending an RFQ.',
    notFound: 'The product could not be found for this URL.',
    breadcrumbProducts: 'Products',
    viewDetail: 'View detail',
  },
  zh: {
    notFoundDescription: '该产品不存在或已从目录中移除。',
    backToCatalog: '返回',
    downloadSpec: '下载技术文件',
    quote: '获取报价',
    gallery: '产品图库',
    detailDescription: '详细描述',
    highlights: '产品亮点',
    qualityControl: '质量控制流程',
    applications: '市场 / 渠道',
    technicalSpecs: '技术规格',
    hsCode: 'HS 编码',
    packagingSpec: '包装规格',
    relatedProducts: '相关产品',
    relatedDescription: '同类产品便于买家在发送 RFQ 前快速比较。',
    notFound: '未找到该产品。',
    breadcrumbProducts: '产品',
    viewDetail: '查看详情',
  },
}

export function ProductDetailPage({ locale }) {
  const { slug } = useParams()
  const catalogData = useBackendData((signal) => loadProductCatalog(locale, signal), [locale])
  const [selectedImage, setSelectedImage] = useState('')
  const copy = DETAIL_COPY[locale] ?? DETAIL_COPY.en

  const product = useMemo(() => {
    return catalogData?.products?.find((item) => item.slug === slug) ?? null
  }, [catalogData, slug])

  const relatedProducts = useMemo(() => {
    if (!catalogData || !product) {
      return []
    }

    return catalogData.products
      .filter((item) => item.categoryId === product.categoryId && item.slug !== product.slug)
      .slice(0, 3)
  }, [catalogData, product])

  const productSeo = buildProductSeo(product, locale)
  const catalogSeo = SEO.products[locale] ?? SEO.products.en
  const technicalSpecifications = useMemo(() => {
    if (!product) {
      return []
    }

    return [
      product.hsCode ? { label: copy.hsCode, value: product.hsCode, featured: true } : null,
      product.packagingSpec ? { label: copy.packagingSpec, value: product.packagingSpec, featured: true } : null,
      ...(product.specifications ?? []),
    ].filter(Boolean)
  }, [copy.hsCode, copy.packagingSpec, product])

  useSeoMeta(
    productSeo
      ? { ...productSeo, locale }
      : { title: catalogSeo.title, description: catalogSeo.description, path: catalogSeo.path, locale },
  )
  useJsonLd('product', buildProductSchema(product))

  const selectedImageUrl =
    product?.gallery?.includes(selectedImage) ? selectedImage : product?.gallery?.[0] ?? product?.image ?? ''

  if (!catalogData) {
    return <PageLoading locale={locale} />
  }

  if (!product) {
    return (
      <main>
        <section className="mx-auto max-w-[1240px] px-4 py-20 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={copy.breadcrumbProducts}
            title={copy.notFound}
            description={copy.notFoundDescription}
          />
          <Link
            className="mt-8 inline-flex h-11 cursor-pointer items-center rounded-full px-6 text-sm font-semibold text-forest-800 ring-1 ring-forest-800/30 transition-colors hover:bg-forest-50"
            to="/products"
          >
            {copy.backToCatalog}
          </Link>
        </section>
      </main>
    )
  }

  const cardClass = 'rounded-2xl bg-white p-6 shadow-card ring-1 ring-forest-950/5'
  const cardTitleClass = 'text-xs font-semibold tracking-[0.2em] text-forest-950/50 uppercase'

  return (
    <main>
      <section className="bg-gradient-to-b from-forest-50 to-stone-25">
        <div className="mx-auto max-w-[1240px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <nav className="flex items-center gap-2 text-sm text-forest-950/50" aria-label="Breadcrumb">
            <Link className="cursor-pointer font-medium text-forest-800 transition-colors hover:text-gold-600" to="/products">
              {copy.breadcrumbProducts}
            </Link>
            <span aria-hidden="true">/</span>
            <span>{product.categoryName}</span>
          </nav>
          <div className="mt-5">
            <SectionHeading
              eyebrow={product.categoryName}
              title={product.name}
              description={product.summary}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] space-y-10 px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-start">
          <div>
            <div
              className="aspect-[4/3] w-full rounded-2xl bg-forest-100 bg-cover bg-center shadow-card"
              style={{ backgroundImage: `url(${selectedImageUrl})` }}
              role="img"
              aria-label={`${product.name} photo`}
            />
            {product.gallery.length > 1 ? (
              <div className="mt-4 flex flex-wrap gap-3">
                {product.gallery.map((image) => (
                  <button
                    key={image}
                    type="button"
                    className={`h-20 w-24 cursor-pointer overflow-hidden rounded-xl transition-all ${
                      selectedImageUrl === image
                        ? 'ring-2 ring-gold-500'
                        : 'ring-1 ring-forest-950/10 hover:ring-forest-950/30'
                    }`}
                    onClick={() => setSelectedImage(image)}
                  >
                    <span
                      className="block h-full w-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${image})` }}
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="space-y-5">
            <div className={cardClass}>
              <p className={cardTitleClass}>{copy.technicalSpecs}</p>
              <dl className="mt-4 divide-y divide-forest-950/8">
                {technicalSpecifications.map((spec) => (
                  <div
                    key={`${spec.label}-${spec.value}`}
                    className="flex items-baseline justify-between gap-4 py-2.5 text-sm"
                  >
                    <dt className={`shrink-0 ${spec.featured ? 'font-semibold text-gold-700' : 'font-medium text-forest-950/50'}`}>
                      {spec.label}
                    </dt>
                    <dd className="text-right text-forest-950/85">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {product.applications.length > 0 ? (
              <div className={cardClass}>
                <p className={cardTitleClass}>{copy.applications}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {product.applications.map((application) => (
                    <li
                      key={application}
                      className="rounded-full bg-forest-50 px-3 py-1.5 text-sm text-forest-800"
                    >
                      {application}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <a
                className="inline-flex h-12 cursor-pointer items-center rounded-full bg-gold-500 px-7 text-sm font-semibold text-forest-950 transition-colors hover:bg-gold-400"
                href={`/products#quote-request`}
              >
                {copy.quote}
              </a>
              {product.specificationFileUrl ? (
                <a
                  className="inline-flex h-12 cursor-pointer items-center rounded-full px-6 text-sm font-semibold text-forest-800 ring-1 ring-forest-800/30 transition-colors hover:bg-forest-50"
                  href={product.specificationFileUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {copy.downloadSpec}
                </a>
              ) : null}
              <Link
                className="inline-flex h-12 cursor-pointer items-center rounded-full px-6 text-sm font-semibold text-forest-950/60 transition-colors hover:text-forest-950"
                to="/products"
              >
                {copy.backToCatalog}
              </Link>
            </div>
          </div>
        </div>

        {product.detailDescription || product.highlights?.length || product.qualityControlSteps?.length ? (
          <div className="space-y-6">
            {product.detailDescription ? (
              <article className={`${cardClass} lg:p-8`}>
                <p className={cardTitleClass}>{copy.detailDescription}</p>
                <div
                  className="prose-fortis mt-4"
                  dangerouslySetInnerHTML={{ __html: sanitizeRichText(product.detailDescription) }}
                />
              </article>
            ) : null}

            {product.highlights?.length || product.qualityControlSteps?.length ? (
              <div className="grid gap-6 md:grid-cols-2">
                {product.highlights?.length ? (
                  <article className={cardClass}>
                    <p className={cardTitleClass}>{copy.highlights}</p>
                    <dl className="mt-4 space-y-3">
                      {product.highlights.map((item) => (
                        <div key={`${item.label}-${item.value}`} className="text-sm">
                          <dt className="font-semibold text-forest-950">{item.label}</dt>
                          <dd className="mt-0.5 leading-relaxed text-forest-950/65">{item.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </article>
                ) : null}

                {product.qualityControlSteps?.length ? (
                  <article className={cardClass}>
                    <p className={cardTitleClass}>{copy.qualityControl}</p>
                    <dl className="mt-4 space-y-3">
                      {product.qualityControlSteps.map((item) => (
                        <div key={`${item.label}-${item.value}`} className="text-sm">
                          <dt className="font-semibold text-forest-950">{item.label}</dt>
                          <dd className="mt-0.5 leading-relaxed text-forest-950/65">{item.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </article>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

        {relatedProducts.length > 0 ? (
          <div>
            <p className={cardTitleClass}>{copy.relatedProducts}</p>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-forest-950/60">
              {copy.relatedDescription}
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.map((item) => (
                <article
                  key={item.id}
                  className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-forest-950/5 transition-shadow duration-300 hover:shadow-card-hover"
                >
                  <Link to={`/products/${item.slug}`} className="block cursor-pointer">
                    <div
                      className="aspect-[4/3] bg-forest-100 bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-105"
                      style={{ backgroundImage: `url(${item.image})` }}
                      role="img"
                      aria-label={`${item.name} thumbnail`}
                    />
                  </Link>
                  <div className="flex flex-1 flex-col p-5">
                    <p className="inline-block self-start rounded-full bg-forest-50 px-2.5 py-1 text-xs font-medium text-forest-800">
                      {item.categoryName}
                    </p>
                    <h3 className="mt-2.5 font-display text-lg leading-snug font-semibold text-forest-950">
                      {item.name}
                    </h3>
                    {item.summary ? (
                      <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-forest-950/60">
                        {item.summary}
                      </p>
                    ) : null}
                    {(item.specifications ?? []).length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {(item.specifications ?? []).slice(0, 2).map((spec) => (
                          <span
                            key={`${spec.label}-${spec.value}`}
                            className="rounded-full bg-stone-25 px-2.5 py-1 text-xs text-forest-950/70 ring-1 ring-forest-950/8"
                          >
                            {spec.value}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    <Link
                      className="mt-auto inline-flex cursor-pointer items-center gap-1.5 pt-4 text-sm font-semibold text-gold-600 transition-colors hover:text-gold-700"
                      to={`/products/${item.slug}`}
                    >
                      {copy.viewDetail}
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M3 8h10m0 0L9 4m4 4l-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </main>
  )
}

function sanitizeRichText(value) {
  if (!value) {
    return ''
  }

  const source = /<[a-z][\s\S]*>/i.test(value)
    ? value
    : value
      .split(/\n{2,}/)
      .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`)
      .join('')
  const template = document.createElement('template')
  template.innerHTML = source
  const allowedTags = new Set(['P', 'BR', 'STRONG', 'B', 'EM', 'I', 'U', 'UL', 'OL', 'LI', 'DIV'])

  function cleanNode(node) {
    Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        if (!allowedTags.has(child.tagName)) {
          child.replaceWith(...Array.from(child.childNodes))
          return
        }
        Array.from(child.attributes).forEach((attribute) => child.removeAttribute(attribute.name))
        cleanNode(child)
      }
    })
  }

  cleanNode(template.content)
  return template.innerHTML
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
