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
    live: 'Thông tin sản phẩm đang được tải từ backend API.',
    backToCatalog: 'Quay lại catalog',
    downloadSpec: 'Tải file kỹ thuật',
    quote: 'Nhận báo giá',
    gallery: 'Gallery sản phẩm',
    applications: 'Thị trường / kênh tiêu thụ',
    technicalSpecs: 'Thông số kỹ thuật',
    relatedProducts: 'Sản phẩm liên quan',
    relatedDescription: 'Các sản phẩm cùng nhóm để buyer so sánh nhanh trước khi gửi RFQ.',
    notFound: 'Không tìm thấy sản phẩm theo đường dẫn này.',
    breadcrumbProducts: 'Sản phẩm',
    thickness: 'Quy cách đóng gói',
    moisture: 'Tiêu chuẩn chất lượng',
    glueType: 'Xuất xứ / chứng nhận',
    size: 'Khối lượng / thùng',
    viewDetail: 'Xem chi tiết',
  },
  en: {
    fallback: 'Showing fallback content because the backend is not available.',
    live: 'Product information is loading from the backend API.',
    backToCatalog: 'Back to catalog',
    downloadSpec: 'Download spec sheet',
    quote: 'Get a quote',
    gallery: 'Product gallery',
    applications: 'Markets / channels',
    technicalSpecs: 'Technical specifications',
    relatedProducts: 'Related products',
    relatedDescription:
      'Products from the same category so buyers can compare before sending an RFQ.',
    notFound: 'The product could not be found for this URL.',
    breadcrumbProducts: 'Products',
    thickness: 'Packing format',
    moisture: 'Quality standard',
    glueType: 'Origin / certification',
    size: 'Net weight / carton',
    viewDetail: 'View detail',
  },
}

export function ProductDetailPage({ locale }) {
  const { slug } = useParams()
  const [catalogData, setCatalogData] = useState(null)
  const [usingFallback, setUsingFallback] = useState(true)
  const [selectedImage, setSelectedImage] = useState('')
  const copy = DETAIL_COPY[locale] ?? DETAIL_COPY.vi

  useEffect(() => {
    const controller = new AbortController()

    async function hydrateCatalog() {
      try {
        const result = await loadProductCatalog(locale, controller.signal)
        setCatalogData(result.data)
        setUsingFallback(result.source === 'fallback')
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
  const catalogSeo = SEO.products[locale] ?? SEO.products.vi

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
          { name: locale === 'vi' ? 'Trang chủ' : 'Home', path: '/' },
          { name: locale === 'vi' ? 'Sản phẩm' : 'Products', path: '/products' },
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
          <div className={`catalog-status ${usingFallback ? 'is-warning' : ''}`}>
            <span className="status-dot" aria-hidden="true"></span>
            <span>{usingFallback ? copy.fallback : copy.live}</span>
          </div>
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
                <div>
                  <dt>{copy.thickness}</dt>
                  <dd>{product.specifications.thickness}</dd>
                </div>
                <div>
                  <dt>{copy.moisture}</dt>
                  <dd>{product.specifications.moisture}</dd>
                </div>
                <div>
                  <dt>{copy.glueType}</dt>
                  <dd>{product.specifications.glueType}</dd>
                </div>
                <div>
                  <dt>{copy.size}</dt>
                  <dd>{product.specifications.size}</dd>
                </div>
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
                      <span>{item.specifications.thickness}</span>
                      <span>{item.specifications.size}</span>
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
