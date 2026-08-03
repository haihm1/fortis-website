import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageLoading } from '../components/PageLoading'
import { PhoneInput } from '../components/PhoneInput'
import { ProductCard } from '../components/ProductCard'
import { SectionHeading } from '../components/SectionHeading'
import { SuccessModal } from '../components/SuccessModal'
import { useBackendData } from '../hooks/useBackendData'
import { useJsonLd } from '../hooks/useJsonLd'
import { useSeoMeta } from '../hooks/useSeoMeta'
import { SEO, buildOrganizationSchema } from '../data/seoConfig'
import { submitContactRequest } from '../services/publicContactApi'
import { loadProductCatalog } from '../services/productCatalogApi'
import { filterProducts, getSpecificationOptions } from '../utils/productCatalog'

const PRODUCTS_PER_PAGE = 8
const EMPTY_PRODUCTS = []

const INPUT_CLASS =
  'h-12 w-full rounded-xl border border-forest-950/15 bg-white px-4 text-sm text-forest-950 transition-colors placeholder:text-forest-950/35 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30 focus:outline-none'
const TEXTAREA_CLASS =
  'w-full rounded-xl border border-forest-950/15 bg-white px-4 py-3 text-sm text-forest-950 transition-colors placeholder:text-forest-950/35 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30 focus:outline-none'

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
  const catalogData = useBackendData((signal) => loadProductCatalog(locale, signal), [locale])
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
    if (!catalogData) {
      return
    }
    setSelectedCategoryId('all')
    setSelectedProductId(catalogData.products[0]?.id ?? null)
    setCurrentPage(1)
    setSearch('')
    setSelectedSpecification('')
  }, [catalogData])

  const seo = SEO.products[locale] ?? SEO.products.en
  useSeoMeta({ title: seo.title, description: seo.description, path: seo.path, locale })
  useJsonLd('organization', buildOrganizationSchema())

  const filterCopy = FILTER_COPY[locale] ?? FILTER_COPY.en
  const quoteStatusCopy = QUOTE_STATUS_COPY[locale] ?? QUOTE_STATUS_COPY.en
  const catalogProducts = catalogData?.products ?? EMPTY_PRODUCTS

  const filteredProducts = useMemo(() => {
    return filterProducts(catalogProducts, {
      categoryId: selectedCategoryId,
      search,
      specification: selectedSpecification,
    })
  }, [
    catalogProducts,
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
        ? catalogProducts
        : catalogProducts.filter((product) => product.categoryId === selectedCategoryId)

    return {
      specifications: getSpecificationOptions(categoryScopedProducts),
    }
  }, [catalogProducts, selectedCategoryId])

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

  if (!catalogData) {
    return <PageLoading locale={locale} />
  }

  const labels = catalogData.labels

  return (
    <main>
      <section className="bg-gradient-to-b from-forest-50 to-stone-25">
        <div className="mx-auto grid max-w-[1240px] items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:px-8 lg:py-20">
          <div>
            <nav className="flex items-center gap-2 text-sm text-forest-950/50" aria-label="Breadcrumb">
              <Link className="cursor-pointer font-medium text-forest-800 transition-colors hover:text-gold-600" to="/">
                {filterCopy.breadcrumbHome}
              </Link>
              <span aria-hidden="true">/</span>
              <span>{filterCopy.breadcrumbCurrent}</span>
            </nav>
            <div className="mt-5">
              <SectionHeading
                eyebrow={catalogData.pageHeader.eyebrow}
                title={catalogData.pageHeader.title}
                description={catalogData.pageHeader.description}
              />
            </div>
          </div>
          <div className="hidden overflow-hidden rounded-2xl shadow-card lg:block">
            <img
              className="aspect-[3/2] h-auto w-full object-cover"
              src="https://picsum.photos/seed/fortis-agriculture-banner/1200/760"
              alt="Agricultural export product catalog banner"
              fetchPriority="high"
              decoding="async"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1240px] items-start gap-8 px-4 pb-16 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8 lg:pb-24">
        <aside className="space-y-5 lg:sticky lg:top-24">
          <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-forest-950/5">
            <p className="text-xs font-semibold tracking-[0.2em] text-forest-950/50 uppercase">
              {filterCopy.categoryLabel}
            </p>
            <div className="mt-3 space-y-1.5">
              <button
                type="button"
                className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors ${
                  selectedCategoryId === 'all'
                    ? 'bg-forest-800 text-white'
                    : 'text-forest-950/80 hover:bg-forest-50'
                }`}
                onClick={() => handleSelectCategory('all')}
              >
                <span>{labels.allProducts}</span>
                <strong
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    selectedCategoryId === 'all' ? 'bg-white/15 text-white' : 'bg-forest-50 text-forest-800'
                  }`}
                >
                  {catalogData.products.length}
                </strong>
              </button>

              {catalogData.categories.map((category) => {
                const count = catalogData.products.filter(
                  (product) => product.categoryId === category.id,
                ).length
                const isActive = selectedCategoryId === category.id

                return (
                  <button
                    key={category.id}
                    type="button"
                    className={`w-full cursor-pointer rounded-xl px-4 py-3 text-left transition-colors ${
                      isActive ? 'bg-forest-800 text-white' : 'text-forest-950/80 hover:bg-forest-50'
                    }`}
                    onClick={() => handleSelectCategory(category.id)}
                  >
                    <span className="flex items-center justify-between text-sm font-medium">
                      <span>{category.name}</span>
                      <strong
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          isActive ? 'bg-white/15 text-white' : 'bg-forest-50 text-forest-800'
                        }`}
                      >
                        {count}
                      </strong>
                    </span>
                    {category.description ? (
                      <small
                        className={`mt-1 block text-xs leading-relaxed ${
                          isActive ? 'text-white/65' : 'text-forest-950/45'
                        }`}
                      >
                        {category.description}
                      </small>
                    ) : null}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-forest-950/5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold tracking-[0.2em] text-forest-950/50 uppercase">
                {filterCopy.title}
              </p>
              <button
                type="button"
                className="cursor-pointer text-xs font-semibold text-gold-600 transition-colors hover:text-gold-700"
                onClick={handleResetFilters}
              >
                {filterCopy.reset}
              </button>
            </div>

            <div className="mt-3 space-y-3">
              <input
                className={INPUT_CLASS}
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
                className={`${INPUT_CLASS} cursor-pointer`}
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

        <div>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-forest-950/50 uppercase">
                {labels.productList}
              </p>
              <strong className="mt-1 block font-display text-xl font-semibold text-forest-950">
                {filteredProducts.length} {filterCopy.resultCount}
              </strong>
            </div>
            <p className="text-sm text-forest-950/50">
              {filterCopy.page} {safeCurrentPage} / {totalPages}
            </p>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="mt-6 rounded-2xl bg-white p-10 text-center text-sm text-forest-950/60 shadow-card ring-1 ring-forest-950/5">
              {labels.empty}
            </div>
          ) : (
            <>
              <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
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

              <div className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label="Product pagination">
                <button
                  type="button"
                  className="inline-flex h-11 cursor-pointer items-center rounded-full px-4 text-sm font-medium text-forest-950/70 ring-1 ring-forest-950/15 transition-colors hover:bg-forest-50 disabled:cursor-not-allowed disabled:opacity-40"
                  onClick={() => handleChangePage(safeCurrentPage - 1)}
                  disabled={safeCurrentPage === 1}
                >
                  {filterCopy.previous}
                </button>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={`inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                      page === safeCurrentPage
                        ? 'bg-forest-800 text-white'
                        : 'text-forest-950/70 ring-1 ring-forest-950/15 hover:bg-forest-50'
                    }`}
                    onClick={() => handleChangePage(page)}
                    aria-current={page === safeCurrentPage ? 'page' : undefined}
                  >
                    {page}
                  </button>
                ))}
                <button
                  type="button"
                  className="inline-flex h-11 cursor-pointer items-center rounded-full px-4 text-sm font-medium text-forest-950/70 ring-1 ring-forest-950/15 transition-colors hover:bg-forest-50 disabled:cursor-not-allowed disabled:opacity-40"
                  onClick={() => handleChangePage(safeCurrentPage + 1)}
                  disabled={safeCurrentPage === totalPages}
                >
                  {filterCopy.next}
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="bg-forest-950" id="quote-request">
        <div className="mx-auto grid max-w-[1240px] gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.2fr] lg:items-start lg:px-8 lg:py-24">
          <div>
            <p className="text-xs font-semibold tracking-[0.25em] text-gold-400 uppercase">
              {catalogData.quoteSection.eyebrow}
            </p>
            <h2 className="mt-3 font-display text-3xl leading-tight font-semibold text-white lg:text-4xl">
              {catalogData.quoteSection.title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/70">
              {catalogData.quoteSection.description}
            </p>
            {selectedProduct ? (
              <p className="mt-6 inline-block rounded-full bg-white/10 px-4 py-2 text-sm text-white/85 ring-1 ring-white/15">
                {quoteStatusCopy.productInterestLabel}:{' '}
                <strong className="font-semibold text-gold-300">{selectedProduct.name}</strong>
              </p>
            ) : null}
          </div>

          <form
            className="grid gap-4 rounded-2xl bg-white p-6 shadow-card-hover sm:grid-cols-2 lg:p-8"
            onSubmit={handleQuoteSubmit}
          >
            <input
              className={INPUT_CLASS}
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
              className={INPUT_CLASS}
              type="text"
              value={quoteForm.companyName}
              placeholder={catalogData.quoteSection.fields.company}
              aria-label={catalogData.quoteSection.fields.company}
              onChange={(event) =>
                setQuoteForm((current) => ({ ...current, companyName: event.target.value }))
              }
            />
            <input
              className={INPUT_CLASS}
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
              className={INPUT_CLASS}
              type="text"
              value={quoteForm.requestedQuantity}
              placeholder={catalogData.quoteSection.fields.quantity}
              aria-label={catalogData.quoteSection.fields.quantity}
              onChange={(event) =>
                setQuoteForm((current) => ({ ...current, requestedQuantity: event.target.value }))
              }
            />
            <input
              className={INPUT_CLASS}
              type="text"
              value={quoteForm.targetMarket}
              placeholder={catalogData.quoteSection.fields.targetMarket}
              aria-label={catalogData.quoteSection.fields.targetMarket}
              onChange={(event) =>
                setQuoteForm((current) => ({ ...current, targetMarket: event.target.value }))
              }
            />
            <textarea
              className={`${TEXTAREA_CLASS} sm:col-span-2`}
              rows="4"
              value={quoteForm.specificationDetails}
              placeholder={catalogData.quoteSection.fields.specificationDetails}
              aria-label={catalogData.quoteSection.fields.specificationDetails}
              onChange={(event) =>
                setQuoteForm((current) => ({ ...current, specificationDetails: event.target.value }))
              }
            />
            <textarea
              className={`${TEXTAREA_CLASS} sm:col-span-2`}
              rows="5"
              value={quoteForm.message}
              placeholder={catalogData.quoteSection.fields.message}
              aria-label={catalogData.quoteSection.fields.message}
              onChange={(event) =>
                setQuoteForm((current) => ({ ...current, message: event.target.value }))
              }
            />
            {quoteFeedback ? (
              <p className="text-sm font-medium text-red-600 sm:col-span-2">{quoteFeedback}</p>
            ) : null}
            <button
              type="submit"
              className="inline-flex h-12 cursor-pointer items-center justify-center rounded-full bg-gold-500 px-8 text-sm font-semibold text-forest-950 transition-colors hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2 sm:justify-self-start"
              disabled={quoteSubmitting}
            >
              {quoteSubmitting ? quoteStatusCopy.sending : catalogData.quoteSection.fields.submit}
            </button>
          </form>
        </div>
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
