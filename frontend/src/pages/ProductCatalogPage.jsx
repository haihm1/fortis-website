import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { PhoneInput } from '../components/PhoneInput'
import { SectionHeading } from '../components/SectionHeading'
import { SuccessModal } from '../components/SuccessModal'
import { useJsonLd } from '../hooks/useJsonLd'
import { useSeoMeta } from '../hooks/useSeoMeta'
import { getFallbackProductCatalog } from '../data/productCatalogFallback'
import { SEO, buildOrganizationSchema } from '../data/seoConfig'
import { submitContactRequest } from '../services/publicContactApi'
import { loadProductCatalog } from '../services/productCatalogApi'
import { filterProducts, getUniqueOptions } from '../utils/productCatalog'

const STATUS_COPY = {
  vi: {
    fallback: 'Backend chưa sẵn sàng, catalog đang hiển thị dữ liệu mẫu.',
    live: 'Catalog đang dùng dữ liệu từ backend API.',
  },
  en: {
    fallback: 'Backend is unavailable, so the catalog is showing fallback content.',
    live: 'Catalog content is loading from the backend API.',
  },
}

const SPEC_LABELS = {
  vi: {
    thickness: 'Quy cách đóng gói',
    moisture: 'Tiêu chuẩn chất lượng',
    glueType: 'Xuất xứ / chứng nhận',
    size: 'Khối lượng / thùng',
  },
  en: {
    thickness: 'Packing format',
    moisture: 'Quality standard',
    glueType: 'Origin / certification',
    size: 'Net weight / carton',
  },
}

const FILTER_COPY = {
  vi: {
    title: 'Bộ lọc catalog',
    search: 'Tìm theo tên, mô tả hoặc nhóm sản phẩm',
    thickness: 'Lọc theo quy cách',
    glueType: 'Lọc theo xuất xứ / chứng nhận',
    moisture: 'Lọc theo tiêu chuẩn',
    reset: 'Xóa bộ lọc',
    all: 'Tất cả',
    noFilters: 'Không có bộ lọc nào khác cho nhóm sản phẩm này.',
    viewDetail: 'Xem chi tiết',
    downloadSpec: 'Tải file kỹ thuật',
  },
  en: {
    title: 'Catalog filters',
    search: 'Search by product name, summary or category',
    thickness: 'Filter by packing',
    glueType: 'Filter by origin / certification',
    moisture: 'Filter by quality standard',
    reset: 'Reset filters',
    all: 'All',
    noFilters: 'No additional filters are available for this product group.',
    viewDetail: 'View detail',
    downloadSpec: 'Download spec sheet',
  },
}

const QUOTE_STATUS_COPY = {
  vi: {
    successTitle: 'Gửi thành công!',
    success: 'Yêu cầu báo giá của bạn đã được tiếp nhận. Đội ngũ Fortis VN sẽ phản hồi sớm nhất có thể.',
    error: 'Không thể gửi yêu cầu lúc này. Vui lòng thử lại.',
    sending: 'Đang gửi...',
    productInterestLabel: 'Sản phẩm đang quan tâm',
    closeModal: 'Đóng',
  },
  en: {
    successTitle: 'Request submitted!',
    success: 'Your quote request has been received. The Fortis VN team will get back to you as soon as possible.',
    error: 'Unable to submit the request right now. Please try again.',
    sending: 'Sending...',
    productInterestLabel: 'Product interest',
    closeModal: 'Close',
  },
}

export function ProductCatalogPage({ locale }) {
  const [catalogData, setCatalogData] = useState(() => getFallbackProductCatalog('vi'))
  const [usingFallback, setUsingFallback] = useState(true)
  const [selectedCategoryId, setSelectedCategoryId] = useState('all')
  const [selectedProductId, setSelectedProductId] = useState(null)
  const [search, setSearch] = useState('')
  const [selectedThickness, setSelectedThickness] = useState('')
  const [selectedGlueType, setSelectedGlueType] = useState('')
  const [selectedMoisture, setSelectedMoisture] = useState('')
  const [quoteForm, setQuoteForm] = useState({
    fullName: '',
    companyName: '',
    email: '',
    phoneDialCode: '+84',
    phoneLocalNumber: '',
    requestedQuantity: '',
    targetMarket: '',
    specificationDetails: '',
    message: '',
  })
  const [quoteSubmitting, setQuoteSubmitting] = useState(false)
  const [quoteFeedback, setQuoteFeedback] = useState('')
  const [quoteSuccess, setQuoteSuccess] = useState(false)
  const productDetailPanelRef = useRef(null)

  useEffect(() => {
    const controller = new AbortController()

    async function hydrateCatalog() {
      try {
        const result = await loadProductCatalog(locale, controller.signal)
        setCatalogData(result.data)
        setUsingFallback(result.source === 'fallback')
        setSelectedCategoryId('all')
        setSelectedProductId(result.data.products[0]?.id ?? null)
        setSearch('')
        setSelectedThickness('')
        setSelectedGlueType('')
        setSelectedMoisture('')
      } catch (error) {
        if (error.name !== 'AbortError') {
          setUsingFallback(true)
        }
      }
    }

    hydrateCatalog()

    return () => controller.abort()
  }, [locale])

  const seo = SEO.products[locale] ?? SEO.products.vi
  useSeoMeta({ title: seo.title, description: seo.description, path: seo.path, locale })
  useJsonLd('organization', buildOrganizationSchema())

  const labels = catalogData.labels
  const statusCopy = STATUS_COPY[locale] ?? STATUS_COPY.vi
  const specLabels = SPEC_LABELS[locale] ?? SPEC_LABELS.vi
  const filterCopy = FILTER_COPY[locale] ?? FILTER_COPY.vi
  const quoteStatusCopy = QUOTE_STATUS_COPY[locale] ?? QUOTE_STATUS_COPY.vi

  const filteredProducts = useMemo(() => {
    return filterProducts(catalogData.products, {
      categoryId: selectedCategoryId,
      search,
      thickness: selectedThickness,
      glueType: selectedGlueType,
      moisture: selectedMoisture,
    })
  }, [
    catalogData.products,
    search,
    selectedCategoryId,
    selectedThickness,
    selectedGlueType,
    selectedMoisture,
  ])

  useEffect(() => {
    if (!filteredProducts.some((product) => product.id === selectedProductId)) {
      setSelectedProductId(filteredProducts[0]?.id ?? null)
    }
  }, [filteredProducts, selectedProductId])

  const selectedProduct = useMemo(() => {
    return (
      filteredProducts.find((product) => product.id === selectedProductId) ??
      filteredProducts[0] ??
      null
    )
  }, [filteredProducts, selectedProductId])

  const availableFilterOptions = useMemo(() => {
    const categoryScopedProducts =
      selectedCategoryId === 'all'
        ? catalogData.products
        : catalogData.products.filter((product) => product.categoryId === selectedCategoryId)

    return {
      thicknesses: getUniqueOptions(
        categoryScopedProducts,
        (product) => product.specifications.thickness,
      ),
      glueTypes: getUniqueOptions(
        categoryScopedProducts,
        (product) => product.specifications.glueType,
      ),
      moistures: getUniqueOptions(
        categoryScopedProducts,
        (product) => product.specifications.moisture,
      ),
    }
  }, [catalogData.products, selectedCategoryId])

  function handleSelectCategory(categoryId) {
    setSelectedCategoryId(categoryId)
    setSelectedThickness('')
    setSelectedGlueType('')
    setSelectedMoisture('')
  }

  function handleResetFilters() {
    setSearch('')
    setSelectedThickness('')
    setSelectedGlueType('')
    setSelectedMoisture('')
  }

  function handleSelectProduct(productId) {
    setSelectedProductId(productId)
    window.requestAnimationFrame(() => {
      const panel = productDetailPanelRef.current
      if (!panel) {
        return
      }

      const stickyHeader = document.querySelector('.topbar')
      const headerOffset = stickyHeader ? stickyHeader.getBoundingClientRect().height : 0
      const viewportHeight = window.innerHeight
      const panelRect = panel.getBoundingClientRect()
      const panelTop = panelRect.top + window.scrollY
      const availableHeight = viewportHeight - headerOffset

      let targetScroll
      if (panelRect.height <= availableHeight) {
        targetScroll = panelTop - headerOffset - (availableHeight - panelRect.height) / 2
      } else {
        targetScroll = panelTop - headerOffset - 24
      }

      window.scrollTo({
        top: Math.max(targetScroll, 0),
        behavior: 'smooth',
      })
    })
  }

  async function handleQuoteSubmit(event) {
    event.preventDefault()
    setQuoteSubmitting(true)
    setQuoteFeedback('')

    try {
      await submitContactRequest({
        fullName: quoteForm.fullName,
        companyName: quoteForm.companyName,
        email: quoteForm.email,
        phoneNumber: `${quoteForm.phoneDialCode} ${quoteForm.phoneLocalNumber}`.trim(),
        productInterest: selectedProduct?.name ?? '',
        requestedQuantity: quoteForm.requestedQuantity,
        targetMarket: quoteForm.targetMarket,
        specificationDetails: quoteForm.specificationDetails,
        message: quoteForm.message,
      })

      setQuoteForm({
        fullName: '',
        companyName: '',
        email: '',
        phoneDialCode: '+84',
        phoneLocalNumber: '',
        requestedQuantity: '',
        targetMarket: '',
        specificationDetails: '',
        message: '',
      })
      setQuoteSuccess(true)
    } catch {
      setQuoteFeedback(quoteStatusCopy.error)
    } finally {
      setQuoteSubmitting(false)
    }
  }

  return (
    <main>
      <section className="catalog-hero">
        <div className="catalog-hero-copy">
          <SectionHeading
            eyebrow={catalogData.pageHeader.eyebrow}
            title={catalogData.pageHeader.title}
            description=""
          />
          {/* <div className={`catalog-status ${usingFallback ? 'is-warning' : ''}`}>
            <span className="status-dot" aria-hidden="true"></span>
            <span>{usingFallback ? statusCopy.fallback : statusCopy.live}</span>
          </div> */}
        </div>
      </section>

      <section className="catalog-section">
        <aside className="catalog-sidebar">
          <div className="catalog-sidebar-card">
            <p className="subsection-title">{catalogData.pageHeader.eyebrow}</p>
            <div className="category-list">
              <button
                type="button"
                className={selectedCategoryId === 'all' ? 'is-active' : ''}
                onClick={() => handleSelectCategory('all')}
              >
                <span>{labels.allProducts}</span>
                <strong>{catalogData.products.length}</strong>
              </button>

              {catalogData.categories.map((category) => {
                const count = catalogData.products.filter(
                  (product) => product.categoryId === category.id,
                ).length

                return (
                  <button
                    key={category.id}
                    type="button"
                    className={selectedCategoryId === category.id ? 'is-active' : ''}
                    onClick={() => handleSelectCategory(category.id)}
                  >
                    <span>{category.name}</span>
                    <strong>{count}</strong>
                    <small>{category.description}</small>
                  </button>
                )
              })}
            </div>
          </div>
        </aside>

        <div className="catalog-content">
          <div className="catalog-block">
            <div className="catalog-block-header">
              <p className="subsection-title">{filterCopy.title}</p>
              <button type="button" className="secondary-button" onClick={handleResetFilters}>
                {filterCopy.reset}
              </button>
            </div>

            <div className="catalog-filter-grid">
              <input
                type="search"
                value={search}
                placeholder={filterCopy.search}
                aria-label={filterCopy.search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <select
                value={selectedThickness}
                aria-label={filterCopy.thickness}
                onChange={(event) => setSelectedThickness(event.target.value)}
              >
                <option value="">{filterCopy.thickness}</option>
                {availableFilterOptions.thicknesses.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <select
                value={selectedGlueType}
                aria-label={filterCopy.glueType}
                onChange={(event) => setSelectedGlueType(event.target.value)}
              >
                <option value="">{filterCopy.glueType}</option>
                {availableFilterOptions.glueTypes.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <select
                value={selectedMoisture}
                aria-label={filterCopy.moisture}
                onChange={(event) => setSelectedMoisture(event.target.value)}
              >
                <option value="">{filterCopy.moisture}</option>
                {availableFilterOptions.moistures.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="catalog-block">
            <div className="catalog-block-header">
              <p className="subsection-title">{labels.productList}</p>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="catalog-empty">{labels.empty}</div>
            ) : (
              <div className="product-catalog-grid">
                {filteredProducts.map((product) => (
                  <article
                    key={product.id}
                    className={`catalog-product-card ${
                      selectedProduct?.id === product.id ? 'is-active' : ''
                    }`}
                    onClick={() => handleSelectProduct(product.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        handleSelectProduct(product.id)
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <div
                      className="catalog-product-image"
                      style={{ backgroundImage: `url(${product.image})` }}
                    />
                    <div className="catalog-product-body">
                      <p className="product-chip">{product.categoryName}</p>
                      <h3>{product.name}</h3>
                      <p>{product.summary}</p>
                      <div className="catalog-product-specs-preview">
                        <span>{product.specifications.thickness}</span>
                        <span>{product.specifications.size}</span>
                      </div>
                      <div className="catalog-product-actions">
                        <Link className="secondary-button" to={`/products/${product.slug}`}>
                          {filterCopy.viewDetail}
                        </Link>
                        {product.specificationFileUrl ? (
                          <a
                            className="secondary-button"
                            href={product.specificationFileUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(event) => event.stopPropagation()}
                          >
                            {filterCopy.downloadSpec}
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {selectedProduct ? (
            <div className="catalog-detail-panel" ref={productDetailPanelRef}>
              <div
                className="catalog-detail-image"
                style={{ backgroundImage: `url(${selectedProduct.image})` }}
              />

              <div className="catalog-detail-content">
                <div className="catalog-block-header">
                  <div>
                    <p className="subsection-title">{labels.productDetail}</p>
                    <h2 className="catalog-detail-title">{selectedProduct.name}</h2>
                  </div>
                  <div className="catalog-detail-actions">
                    <Link className="secondary-button" to={`/products/${selectedProduct.slug}`}>
                      {filterCopy.viewDetail}
                    </Link>
                    <a className="primary-button" href="#quote-request">
                      {selectedProduct.quoteLabel}
                    </a>
                  </div>
                </div>

                <p className="catalog-detail-summary">{selectedProduct.summary}</p>

                <div className="catalog-spec-grid">
                  <div className="catalog-spec-card">
                    <p className="subsection-title">{labels.technicalSpecs}</p>
                    <dl className="catalog-spec-list">
                      <div>
                        <dt>{specLabels.thickness}</dt>
                        <dd>{selectedProduct.specifications.thickness}</dd>
                      </div>
                      <div>
                        <dt>{specLabels.moisture}</dt>
                        <dd>{selectedProduct.specifications.moisture}</dd>
                      </div>
                      <div>
                        <dt>{specLabels.glueType}</dt>
                        <dd>{selectedProduct.specifications.glueType}</dd>
                      </div>
                      <div>
                        <dt>{specLabels.size}</dt>
                        <dd>{selectedProduct.specifications.size}</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="catalog-spec-card">
                    <p className="subsection-title">{labels.applications}</p>
                    <ul className="catalog-application-list">
                      {selectedProduct.applications.map((application) => (
                        <li key={application}>{application}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="quote-section" id="quote-request">
        <div className="quote-copy">
          <SectionHeading
            eyebrow={catalogData.quoteSection.eyebrow}
            title={catalogData.quoteSection.title}
            description={catalogData.quoteSection.description}
          />
        </div>

        <form className="quote-form" onSubmit={handleQuoteSubmit}>
          <input
            type="text"
            required
            value={quoteForm.fullName}
            placeholder={catalogData.quoteSection.fields.name}
            aria-label={catalogData.quoteSection.fields.name}
            onChange={(event) =>
              setQuoteForm((current) => ({ ...current, fullName: event.target.value }))
            }
          />
          <input
            type="text"
            value={quoteForm.companyName}
            placeholder={catalogData.quoteSection.fields.company}
            aria-label={catalogData.quoteSection.fields.company}
            onChange={(event) =>
              setQuoteForm((current) => ({ ...current, companyName: event.target.value }))
            }
          />
          <input
            type="email"
            required
            value={quoteForm.email}
            placeholder={catalogData.quoteSection.fields.email}
            aria-label={catalogData.quoteSection.fields.email}
            onChange={(event) =>
              setQuoteForm((current) => ({ ...current, email: event.target.value }))
            }
          />
          <PhoneInput
            required
            dialCode={quoteForm.phoneDialCode}
            localNumber={quoteForm.phoneLocalNumber}
            ariaLabel={catalogData.quoteSection.fields.phone}
            onDialCodeChange={(code) =>
              setQuoteForm((current) => ({ ...current, phoneDialCode: code }))
            }
            onLocalNumberChange={(num) =>
              setQuoteForm((current) => ({ ...current, phoneLocalNumber: num }))
            }
          />
          <input
            type="text"
            value={quoteForm.requestedQuantity}
            placeholder={catalogData.quoteSection.fields.quantity}
            aria-label={catalogData.quoteSection.fields.quantity}
            onChange={(event) =>
              setQuoteForm((current) => ({ ...current, requestedQuantity: event.target.value }))
            }
          />
          <input
            type="text"
            value={quoteForm.targetMarket}
            placeholder={catalogData.quoteSection.fields.targetMarket}
            aria-label={catalogData.quoteSection.fields.targetMarket}
            onChange={(event) =>
              setQuoteForm((current) => ({ ...current, targetMarket: event.target.value }))
            }
          />
          <label className="quote-file-field">
          {selectedProduct ? (
            <p className="form-message quote-selected-product">
              {quoteStatusCopy.productInterestLabel}: <strong>{selectedProduct.name}</strong>
            </p>
          ) : null}
          </label>
          <textarea
            rows="4"
            value={quoteForm.specificationDetails}
            placeholder={catalogData.quoteSection.fields.specificationDetails}
            aria-label={catalogData.quoteSection.fields.specificationDetails}
            onChange={(event) =>
              setQuoteForm((current) => ({ ...current, specificationDetails: event.target.value }))
            }
          />
          <textarea
            rows="5"
            value={quoteForm.message}
            placeholder={catalogData.quoteSection.fields.message}
            aria-label={catalogData.quoteSection.fields.message}
            onChange={(event) =>
              setQuoteForm((current) => ({ ...current, message: event.target.value }))
            }
          />
          {quoteFeedback ? <p className="form-message error">{quoteFeedback}</p> : null}
          <button type="submit" className="primary-button" disabled={quoteSubmitting}>
            {quoteSubmitting ? quoteStatusCopy.sending : catalogData.quoteSection.fields.submit}
          </button>
        </form>
      </section>

      <SuccessModal
        open={quoteSuccess}
        title={quoteStatusCopy.successTitle}
        message={quoteStatusCopy.success}
        closeLabel={quoteStatusCopy.closeModal}
        onClose={() => setQuoteSuccess(false)}
      />
    </main>
  )
}
