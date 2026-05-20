import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useJsonLd } from '../hooks/useJsonLd'
import { useSeoMeta } from '../hooks/useSeoMeta'
import { getFallbackExportMarket } from '../data/exportMarketFallback'
import { buildBreadcrumbSchema, buildOrganizationSchema } from '../data/seoConfig'
import { loadExportMarket } from '../services/exportMarketApi'
import { formatDisplayDate } from '../utils/dateFormat'

const MotionArticle = motion.article

export function ExportMarketPage({ locale }) {
  const [pageData, setPageData] = useState(() => getFallbackExportMarket(locale))

  useEffect(() => {
    const controller = new AbortController()

    async function hydrateExportMarket() {
      try {
        const result = await loadExportMarket(locale, controller.signal)
        setPageData(result.data)
      } catch (error) {
        if (error.name !== 'AbortError') {
          setPageData(getFallbackExportMarket(locale))
        }
      }
    }

    hydrateExportMarket()

    return () => controller.abort()
  }, [locale])

  const featuredArticle = useMemo(
    () => pageData.articles.find((article) => article.featured) ?? pageData.articles[0],
    [pageData.articles],
  )
  const listArticles = pageData.articles.filter((article) => article.id !== featuredArticle?.id)

  useSeoMeta({
    title: pageData.pageHeader.title,
    description: pageData.pageHeader.description,
    path: '/export-market',
    locale,
  })
  useJsonLd('organization', buildOrganizationSchema())
  useJsonLd(
    'export-market-breadcrumb',
    buildBreadcrumbSchema([
      { name: pageData.labels.breadcrumbHome, path: '/' },
      { name: pageData.labels.breadcrumbCurrent, path: '/export-market' },
    ]),
  )

  return (
    <main className="export-market-page">
      <section className="export-market-hero">
        <nav className="catalog-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">{pageData.labels.breadcrumbHome}</Link>
          <span aria-hidden="true">/</span>
          <span>{pageData.labels.breadcrumbCurrent}</span>
        </nav>
        <p className="section-eyebrow">{pageData.pageHeader.eyebrow}</p>
        <h1>{pageData.pageHeader.title}</h1>
        <p>{pageData.pageHeader.description}</p>
      </section>

      <section className="export-market-list-section">
        {featuredArticle ? (
          <MotionArticle
            className="export-market-featured-card"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link to={`/export-market/${featuredArticle.slug}`} className="export-market-featured-image">
              <img src={featuredArticle.image} alt={`${featuredArticle.title} thumbnail`} />
            </Link>
            <div className="export-market-featured-body">
              <ArticleMeta article={featuredArticle} />
              <h2>
                <Link to={`/export-market/${featuredArticle.slug}`}>{featuredArticle.title}</Link>
              </h2>
              <p>{featuredArticle.excerpt}</p>
              <Link className="primary-button" to={`/export-market/${featuredArticle.slug}`}>
                {pageData.labels.readMore}
              </Link>
            </div>
          </MotionArticle>
        ) : null}

        {pageData.articles.length === 0 ? (
          <div className="catalog-empty">{pageData.labels.noArticles}</div>
        ) : (
          <div className="export-market-card-grid">
            {listArticles.map((article, index) => (
              <ArticleCard
                article={article}
                key={article.id}
                readMoreLabel={pageData.labels.readMore}
                index={index}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

function ArticleCard({ article, readMoreLabel, index }) {
  return (
    <MotionArticle
      className="export-market-card"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, delay: index * 0.06 }}
    >
      <Link className="export-market-card-image" to={`/export-market/${article.slug}`}>
        <img src={article.image} alt={`${article.title} thumbnail`} />
      </Link>
      <div className="export-market-card-body">
        <ArticleMeta article={article} />
        <h2>
          <Link to={`/export-market/${article.slug}`}>{article.title}</Link>
        </h2>
        <p>{article.excerpt}</p>
        <Link className="export-market-read-more" to={`/export-market/${article.slug}`}>
          {readMoreLabel}
        </Link>
      </div>
    </MotionArticle>
  )
}

function ArticleMeta({ article }) {
  return (
    <div className="export-market-meta">
      <span>{formatDisplayDate(article.publishedAt)}</span>
      <span>{article.category}</span>
    </div>
  )
}
