import { useEffect, useMemo, useState } from 'react'
import { useJsonLd } from '../hooks/useJsonLd'
import { useSeoMeta } from '../hooks/useSeoMeta'
import { getFallbackHomeContent } from '../locales/homeContentFallback'
import { CertificatesSection } from '../sections/CertificatesSection'
import { CoreValuesSection } from '../sections/CoreValuesSection'
import { FeaturedProductsSection } from '../sections/FeaturedProductsSection'
import { HeroSection } from '../sections/HeroSection'
import { loadHomeContent } from '../services/homeContentApi'
import {
  SEO,
  buildOrganizationSchema,
  buildWebsiteSchema,
} from '../data/seoConfig'

const UI_COPY = {
  vi: {
    apiLive: 'Đang dùng dữ liệu từ API backend.',
    apiFallback:
      'Backend chưa sẵn sàng, website đang hiển thị dữ liệu mẫu để bạn tiếp tục thiết kế.',
  },
  en: {
    apiLive: 'Using live content from the backend API.',
    apiFallback:
      'Backend is unavailable, so the homepage is rendering fallback content for design work.',
  },
}

export function HomePage({ locale }) {
  const [pageData, setPageData] = useState(() => getFallbackHomeContent('vi'))
  const [activeSlide, setActiveSlide] = useState(0)
  const [loading, setLoading] = useState(true)
  const [usingFallback, setUsingFallback] = useState(true)

  useEffect(() => {
    const controller = new AbortController()

    async function hydrateHomePage() {
      setLoading(true)

      try {
        const result = await loadHomeContent(locale, controller.signal)
        setPageData(result.data)
        setUsingFallback(result.source === 'fallback')
        setActiveSlide(0)
      } catch (error) {
        if (error.name !== 'AbortError') {
          setUsingFallback(true)
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    hydrateHomePage()

    return () => controller.abort()
  }, [locale])

  useEffect(() => {
    if (!pageData?.heroSlides?.length) {
      return undefined
    }

    const timer = window.setInterval(() => {
      setActiveSlide((currentSlide) => {
        return (currentSlide + 1) % pageData.heroSlides.length
      })
    }, 5000)

    return () => window.clearInterval(timer)
  }, [pageData?.heroSlides])

  const copy = useMemo(() => UI_COPY[locale] ?? UI_COPY.vi, [locale])
  const seo = SEO.home[locale] ?? SEO.home.vi

  useSeoMeta({ title: seo.title, description: seo.description, path: seo.path, locale })
  useJsonLd('organization', buildOrganizationSchema())
  useJsonLd('website', buildWebsiteSchema())

  return (
    <main>
      <HeroSection
        company={pageData.company}
        slides={pageData.heroSlides}
        activeSlide={activeSlide}
        onSelectSlide={setActiveSlide}
      />

      {/* <div className={`status-strip ${usingFallback ? 'status-warning' : ''}`}>
        <span className="status-dot" aria-hidden="true"></span>
        <span>{usingFallback ? copy.apiFallback : copy.apiLive}</span>
        {loading ? <span className="status-loading">Loading...</span> : null}
      </div> */}

      <CoreValuesSection
        section={pageData.coreValuesSection}
        values={pageData.coreValues}
      />

      <FeaturedProductsSection
        section={pageData.featuredProductsSection}
        products={pageData.featuredProducts}
      />

      {/* <CertificatesSection
        section={pageData.credentialsSection}
        certificates={pageData.certificates}
        partners={pageData.partners}
      /> */}
    </main>
  )
}
