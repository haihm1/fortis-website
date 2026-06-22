import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PhoneInput } from '../components/PhoneInput'
import { ProductCard } from '../components/ProductCard'
import { SectionHeading } from '../components/SectionHeading'
import { SuccessModal } from '../components/SuccessModal'
import { useJsonLd } from '../hooks/useJsonLd'
import { useSeoMeta } from '../hooks/useSeoMeta'
import { getFallbackProductCatalog } from '../data/productCatalogFallback'
import { SEO, buildOrganizationSchema } from '../data/seoConfig'
import { submitContactRequest } from '../services/publicContactApi'
import { loadProductCatalog } from '../services/productCatalogApi'
import { filterProducts, getSpecificationOptions } from '../utils/productCatalog'

const PRODUCTS_PER_PAGE = 8

const FILTER_COPY = {
  vi: {
    title: 'Bộ lọc catalog',
    search: 'Tìm theo tên, mô tả hoặc nhóm sản phẩm',
    specification: 'Lọc theo thông số kỹ thuật',
    reset: 'Xóa bộ lọc',
    all: 'Tất cả',
    noFilters: 'Không có bộ lọc nào khác cho nhóm sản phẩm này.',
    viewDetail: 'Xem chi tiết',
    downloadSpec: 'Tải file kỹ thuật',
    breadcrumbHome: 'Trang chủ',
    breadcrumbCurrent: 'Sản phẩm',
    resultCount: 'sản phẩm phù hợp',
    categoryLabel: 'Danh mục',
    selectProduct: 'Chọn sản phẩm',
    previous: 'Trước',
    next: 'Sau',
    page: 'Trang',
  },
  en: {
    title: 'Catalog filters',
    search: 'Search by product name, summary or category',
    specification: 'Filter by technical specification',
    reset: 'Reset filters',
    all: 'All',
    noFilters: 'No additional filters are available for this product group.',
    viewDetail: 'View detail',
    downloadSpec: 'Download spec sheet',
    breadcrumbHome: 'Home',
    breadcrumbCurrent: 'Products',
    resultCount: 'matching products',
    categoryLabel: 'Category',
    selectProduct: 'Select product',
    previous: 'Previous',
    next: 'Next',
    page: 'Page',
  },
  zh: {
    title: '目录筛选',
    search: '按产品名称、简介或分类搜索',
    specification: '按技术规格筛选',
    reset: '重置筛选',
    all: '全部',
    noFilters: '该产品组暂无其他筛选条件。',
    viewDetail: '查看详情',
    downloadSpec: '下载技术文件',
    breadcrumbHome: '首页',
    breadcrumbCurrent: '产品',
    resultCount: '个匹配产品',
    categoryLabel: '分类',
    selectProduct: '选择产品',
    previous: '上一页',
    next: '下一页',
    page: '第',
  },
}

const QUOTE_STATUS_COPY = {
  vi: {
    successTitle: 'Gửi thành công!',
    success: 'Yêu cầu báo giá của bạn đã được tiếp nhận. Đội ngũ FortisVN sẽ phản hồi sớm nhất có thể.',
    error: 'Không thể gửi yêu cầu lúc này. Vui lòng thử lại.',
    sending: 'Đang gửi...',
    productInterestLabel: 'Sản phẩm đang quan tâm',
    closeModal: 'Đóng',
  },
  en: {
    successTitle: 'Request submitted!',
    success: 'Your quote request has been received. The FortisVN team will get back to you as soon as possible.',
    error: 'Unable to submit the request right now. Please try again.',
    sending: 'Sending...',
    productInterestLabel: 'Product interest',
    closeModal: 'Close',
  },
  zh: {
    successTitle: '提交成功！',
    success: '您的报价请求已收到。FortisVN 团队会尽快回复。',
    error: '暂时无法提交请求。请稍后再试。',
    sending: '提交中...',
    productInterestLabel: '感兴趣的产品',
    closeModal: '关闭',
  },
}

export function ProductCatalogPage({ locale }) {
  const [catalogData, setCatalogData] = useState(() => getFallbackProductCatalog(locale))
  const [selectedCategoryId, setSelectedCategoryId] = useState('all')
  const [selectedProductId, setSelectedProductId] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState('')
  const [selectedSpecification, setSelectedSpecification] = useState('')
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

  useEffect(() => {
    const controller = new AbortController()

    async function hydrateCatalog() {
      try {
        const result = await loadProductCatalog(locale, controller.signal)
        setCatalogData(result.data)
        setSelectedCategoryId('all')
        setSelectedProductId(result.data.products[0]?.id ?? null)
        setCurrentPage(1)
        setSearch('')
        setSelectedSpecification('')
      } catch (error) {
        if (error.name !== 'AbortError') {
          const fallback = getFallbackProductCatalog(locale)
          setCatalogData(fallback)
          setSelectedProductId(fallback.products[0]?.id ?? null)
        }
      }
    }

    hydrateCatalog()

    return () => controller.abort()
  }, [locale])

  const seo = SEO.products[locale] ?? SEO.products.en
  useSeoMeta({ title: seo.title, description: seo.description, path: seo.path, locale })
  useJsonLd('organization', buildOrganizationSchema())

  const labels = catalogData.labels
  const filterCopy = FILTER_COPY[locale] ?? FILTER_COPY.en
  const quoteStatusCopy = QUOTE_STATUS_COPY[locale] ?? QUOTE_STATUS_COPY.en

  const filteredProducts = useMemo(() => {
    return filterProducts(catalogData.products, {
      categoryId: selectedCategoryId,
      search,
      specification: selectedSpecification,
    })
  }, [
    catalogData.products,
    search,
    selectedCategoryId,
    selectedSpecification,
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

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const paginatedProducts = useMemo(() => {
    const firstIndex = (safeCurrentPage - 1) * PRODUCTS_PER_PAGE
    return filteredProducts.slice(firstIndex, firstIndex + PRODUCTS_PER_PAGE)
  }, [filteredProducts, safeCurrentPage])

  const availableFilterOptions = useMemo(() => {
    const categoryScopedProducts =
      selectedCategoryId === 'all'
        ? catalogData.products
        : catalogData.products.filter((product) => product.categoryId === selectedCategoryId)

    return {
      specifications: getSpecificationOptions(categoryScopedProducts),
    }
  }, [catalogData.products, selectedCategoryId])

  function handleSelectCategory(categoryId) {
    setSelectedCategoryId(categoryId)
    setCurrentPage(1)
    setSelectedSpecification('')
  }

  function handleResetFilters() {
    setSearch('')
    setCurrentPage(1)
    setSelectedSpecification('')
  }

  function handleSelectProduct(product) {
    setSelectedProductId(product.id)
    setQuoteForm((current) => ({
      ...current,
      productInterest: product.name,
    }))
  }

  function handleChangePage(nextPage) {
    setCurrentPage(Math.min(Math.max(nextPage, 1), totalPages))
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
    <main className="b2b-catalog-page">
      <section className="catalog-hero b2b-catalog-hero">
        <div className="catalog-hero-copy">
          <nav className="catalog-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">{filterCopy.breadcrumbHome}</Link>
            <span aria-hidden="true">/</span>
            <span>{filterCopy.breadcrumbCurrent}</span>
          </nav>
          <SectionHeading
            eyebrow={catalogData.pageHeader.eyebrow}
            title={catalogData.pageHeader.title}
            description={catalogData.pageHeader.description}
          />
        </div>
        <div className="b2b-catalog-hero-image">
          <img
            src="https://picsum.photos/seed/fortis-agriculture-banner/1200/760"
            alt="Agricultural export product catalog banner"
            fetchPriority="high"
            decoding="async"
          />
        </div>
      </section>

      <section className="catalog-section b2b-catalog-layout">
        <aside className="catalog-sidebar">
          <div className="catalog-sidebar-card">
            <p className="subsection-title">{filterCopy.categoryLabel}</p>
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

          <div className="catalog-sidebar-card">
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
                onChange={(event) => {
                  setSearch(event.target.value)
                  setCurrentPage(1)
                }}
              />
              <select
                value={selectedSpecification}
                aria-label={filterCopy.specification}
                onChange={(event) => {
                  setSelectedSpecification(event.target.value)
                  setCurrentPage(1)
                }}
              >
                <option value="">{filterCopy.specification}</option>
                {availableFilterOptions.specifications.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </aside>

        <div className="catalog-content">
          <div className="catalog-block b2b-product-toolbar">
            <div>
              <p className="subsection-title">{labels.productList}</p>
              <strong>
                {filteredProducts.length} {filterCopy.resultCount}
              </strong>
            </div>
            <p>
              {filterCopy.page} {safeCurrentPage} / {totalPages}
            </p>
          </div>

          <div className="catalog-block b2b-grid-block">
            {filteredProducts.length === 0 ? (
              <div className="catalog-empty">{labels.empty}</div>
            ) : (
              <>
                <div className="product-catalog-grid b2b-product-grid">
                  {paginatedProducts.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={index}
                      image={getProductThumbnail(product)}
                      isActive={selectedProduct?.id === product.id}
                      labels={filterCopy}
                      onSelect={handleSelectProduct}
                    />
                  ))}
                </div>

                <div className="catalog-pagination" aria-label="Product pagination">
                  <button
                    type="button"
                    onClick={() => handleChangePage(safeCurrentPage - 1)}
                    disabled={safeCurrentPage === 1}
                  >
                    {filterCopy.previous}
                  </button>
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      className={page === safeCurrentPage ? 'is-active' : ''}
                      onClick={() => handleChangePage(page)}
                      aria-current={page === safeCurrentPage ? 'page' : undefined}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleChangePage(safeCurrentPage + 1)}
                    disabled={safeCurrentPage === totalPages}
                  >
                    {filterCopy.next}
                  </button>
                </div>
              </>
            )}
          </div>
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

function getProductThumbnail(product) {
  return product.image || product.gallery?.[0] || 'https://picsum.photos/seed/fortis-product-fallback/900/720'
}
