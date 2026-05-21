import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { SectionHeading } from '../components/SectionHeading'
import { useJsonLd } from '../hooks/useJsonLd'
import { useSeoMeta } from '../hooks/useSeoMeta'
import { SEO, buildProductSeo, buildProductSchema, buildBreadcrumbSchema } from '../data/seoConfig'
import { loadProductCatalog } from '../services/productCatalogApi'

const DETAIL_COPY = {
  vi: {
    fallback: 'Đang hiển thị dữ liệu mẫu vì backend chưa sẵn sàng.',
    backToCatalog: 'Quay lại',
    downloadSpec: 'Tải file kỹ thuật',
    quote: 'Nhận báo giá',
    gallery: 'Gallery sản phẩm',
    detailDescription: 'Mô tả chi tiết',
    highlights: 'Điểm nổi bật',
    qualityControl: 'Quy trình kiểm soát chất lượng',
    applications: 'Thị trường / kênh tiêu thụ',
    technicalSpecs: 'Thông số kỹ thuật',
    relatedProducts: 'Sản phẩm liên quan',
    relatedDescription: 'Các sản phẩm cùng nhóm để buyer so sánh nhanh trước khi gửi RFQ.',
    notFound: 'Không tìm thấy sản phẩm theo đường dẫn này.',
    breadcrumbProducts: 'Sản phẩm',
    viewDetail: 'Xem chi tiết',
  },
  en: {
    fallback: 'Showing fallback content because the backend is not available.',
    backToCatalog: 'Back',
    downloadSpec: 'Download spec sheet',
    quote: 'Get a quote',
    gallery: 'Product gallery',
    detailDescription: 'Detailed description',
    highlights: 'Highlights',
    qualityControl: 'Quality control process',
    applications: 'Markets / channels',
    technicalSpecs: 'Technical specifications',
    relatedProducts: 'Related products',
    relatedDescription:
      'Products from the same category so buyers can compare before sending an RFQ.',
    notFound: 'The product could not be found for this URL.',
    breadcrumbProducts: 'Products',
    viewDetail: 'View detail',
  },
  zh: {
    fallback: '由于后端暂不可用，正在显示备用内容。',
    backToCatalog: '返回',
    downloadSpec: '下载技术文件',
    quote: '获取报价',
    gallery: '产品图库',
    detailDescription: '详细描述',
    highlights: '产品亮点',
    qualityControl: '质量控制流程',
    applications: '市场 / 渠道',
    technicalSpecs: '技术规格',
    relatedProducts: '相关产品',
    relatedDescription: '同类产品便于买家在发送 RFQ 前快速比较。',
    notFound: '未找到该产品。',
    breadcrumbProducts: '产品',
    viewDetail: '查看详情',
  },
}

export function ProductDetailPage({ locale }) {
  const { slug } = useParams()
  const [catalogData, setCatalogData] = useState(null)
  const [selectedImage, setSelectedImage] = useState('')
  const copy = DETAIL_COPY[locale] ?? DETAIL_COPY.en

  useEffect(() => {
    const controller = new AbortController()

    async function hydrateCatalog() {
      try {
        const result = await loadProductCatalog(locale, controller.signal)
        setCatalogData(result.data)
      } catch (error) {
        if (error.name !== 'AbortError') {
          setCatalogData(null)
        }
      }
    }

    hydrateCatalog()
    return () => controller.abort()
  }, [locale])

  const product = useMemo(() => {
    return catalogData?.products.find((item) => item.slug === slug) ?? null
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

  useSeoMeta(
    productSeo
      ? { ...productSeo, locale }
      : { title: catalogSeo.title, description: catalogSeo.description, path: catalogSeo.path, locale },
  )
  useJsonLd('product', buildProductSchema(product))
  useJsonLd(
    'breadcrumb',
    product
      ? buildBreadcrumbSchema([
          { name: locale === 'vi' ? 'Trang chủ' : locale === 'zh' ? '首页' : 'Home', path: '/' },
          { name: locale === 'vi' ? 'Sản phẩm' : locale === 'zh' ? '产品' : 'Products', path: '/products' },
          { name: product.name, path: `/products/${product.slug}` },
        ])
      : null,
  )

  const selectedImageUrl =
    product?.gallery?.includes(selectedImage) ? selectedImage : product?.gallery?.[0] ?? product?.image ?? ''

  if (catalogData && !product) {
    return (
      <main>
        <section className="catalog-hero">
          <div className="catalog-hero-copy">
            <SectionHeading
              eyebrow={copy.breadcrumbProducts}
              title={copy.notFound}
              description={copy.fallback}
            />
            <Link className="secondary-button detail-back-link" to="/products">
              {copy.backToCatalog}
            </Link>
          </div>
        </section>
      </main>
    )
  }

  if (!catalogData || !product) {
    return null
  }

  return (
    <main>
      <section className="catalog-hero">
        <div className="catalog-hero-copy">
          <p className="product-chip">
            {copy.breadcrumbProducts} / {product.categoryName}
          </p>
          <SectionHeading
            eyebrow={product.categoryName}
            title={product.name}
            description={product.summary}
          />
        </div>
      </section>

      <section className="product-detail-page">
        <div className="product-detail-main">
          <div className="product-detail-gallery">
            <div
              className="product-detail-gallery-main"
              style={{ backgroundImage: `url(${selectedImageUrl})` }}
            />
            <div className="product-detail-gallery-thumbs">
              {product.gallery.map((image) => (
                <button
                  key={image}
                  type="button"
                  className={selectedImageUrl === image ? 'is-active' : ''}
                  onClick={() => setSelectedImage(image)}
                >
                  <span style={{ backgroundImage: `url(${image})` }} />
                </button>
              ))}
            </div>
          </div>

          <div className="product-detail-sidebar">
            <div className="catalog-spec-card">
              <p className="subsection-title">{copy.technicalSpecs}</p>
              <dl className="catalog-spec-list">
                {(product.specifications ?? []).map((spec) => (
                  <div key={`${spec.label}-${spec.value}`}>
                    <dt>{spec.label}</dt>
                    <dd>{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="catalog-spec-card">
              <p className="subsection-title">{copy.applications}</p>
              <ul className="catalog-application-list">
                {product.applications.map((application) => (
                  <li key={application}>{application}</li>
                ))}
              </ul>
            </div>

            <div className="product-detail-actions">
              <Link className="secondary-button detail-back-link" to="/products">
                {copy.backToCatalog}
              </Link>
              <a className="primary-button" href={`/products#quote-request`}>
                {copy.quote}
              </a>
              {product.specificationFileUrl ? (
                <a
                  className="secondary-button detail-download-link"
                  href={product.specificationFileUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {copy.downloadSpec}
                </a>
              ) : null}
            </div>
          </div>
        </div>

        {product.detailDescription || product.highlights?.length || product.qualityControlSteps?.length ? (
          <div className="product-detail-content">
            {product.detailDescription ? (
              <article className="catalog-spec-card product-detail-copy">
                <p className="subsection-title">{copy.detailDescription}</p>
                <div
                  className="product-rich-text"
                  dangerouslySetInnerHTML={{ __html: sanitizeRichText(product.detailDescription) }}
                />
              </article>
            ) : null}

            {product.highlights?.length || product.qualityControlSteps?.length ? (
              <div className="product-detail-secondary-grid">
                {product.highlights?.length ? (
                  <article className="catalog-spec-card">
                    <p className="subsection-title">{copy.highlights}</p>
                    <dl className="catalog-spec-list">
                      {product.highlights.map((item) => (
                        <div key={`${item.label}-${item.value}`}>
                          <dt>{item.label}</dt>
                          <dd>{item.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </article>
                ) : null}

                {product.qualityControlSteps?.length ? (
                  <article className="catalog-spec-card">
                    <p className="subsection-title">{copy.qualityControl}</p>
                    <dl className="catalog-spec-list">
                      {product.qualityControlSteps.map((item) => (
                        <div key={`${item.label}-${item.value}`}>
                          <dt>{item.label}</dt>
                          <dd>{item.value}</dd>
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
          <div className="catalog-block">
            <div className="catalog-block-header">
              <div>
                <p className="subsection-title">{copy.relatedProducts}</p>
                <p className="catalog-detail-summary">{copy.relatedDescription}</p>
              </div>
            </div>

            <div className="product-catalog-grid">
              {relatedProducts.map((item) => (
                <article key={item.id} className="catalog-product-card">
                  <div
                    className="catalog-product-image"
                    style={{ backgroundImage: `url(${item.image})` }}
                  />
                  <div className="catalog-product-body">
                    <p className="product-chip">{item.categoryName}</p>
                    <h3>{item.name}</h3>
                    <p>{item.summary}</p>
                    <div className="catalog-product-specs-preview">
                      {(item.specifications ?? []).slice(0, 2).map((spec) => (
                        <span key={`${spec.label}-${spec.value}`}>{spec.value}</span>
                      ))}
                    </div>
                    <Link className="secondary-button" to={`/products/${item.slug}`}>
                      {copy.viewDetail}
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
