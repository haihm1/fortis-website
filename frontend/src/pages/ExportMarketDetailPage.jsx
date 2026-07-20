import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PageLoading } from '../components/PageLoading'
import { useBackendData } from '../hooks/useBackendData'
import { useJsonLd } from '../hooks/useJsonLd'
import { useSeoMeta } from '../hooks/useSeoMeta'
import { buildOrganizationSchema } from '../data/seoConfig'
import { loadExportMarketArticle } from '../services/exportMarketApi'
import { formatDisplayDate } from '../utils/dateFormat'

const MotionDiv = motion.div

export function ExportMarketDetailPage({ locale }) {
  const { slug } = useParams()
  const pageData = useBackendData(
    (signal) => loadExportMarketArticle(locale, slug, signal),
    [locale, slug],
  )
  const article = pageData?.article

  useSeoMeta({
    title: article?.title ?? '',
    description: article?.excerpt ?? '',
    path: `/export-market/${slug}`,
    locale,
  })
  useJsonLd('organization', buildOrganizationSchema())

  if (!pageData) {
    return <PageLoading locale={locale} />
  }

  return (
    <main className="export-market-detail-page">
      <section className="export-market-detail-hero">
        <nav className="catalog-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">{pageData.labels.breadcrumbHome}</Link>
          <span aria-hidden="true">/</span>
          <Link to="/export-market">{pageData.labels.breadcrumbCurrent}</Link>
          <span aria-hidden="true">/</span>
          <span>{article.title}</span>
        </nav>
      </section>

      <section className="export-market-detail-layout">
        <MotionDiv
          className="export-market-article"
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="export-market-article-meta">
            <span>{article.author}</span>
            <span>{formatDisplayDate(article.publishedAt)}</span>
            <span>{article.category}</span>
          </div>
          <h1>{article.title}</h1>
          <img
            className="export-market-article-image"
            src={article.image}
            alt={article.title}
            fetchPriority="high"
            decoding="async"
          />
          <div className="export-market-article-content">
            {article.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </MotionDiv>

        <aside className="export-market-sidebar">
          <SidebarList title={pageData.labels.latestPosts} articles={pageData.latestPosts} />
          <SidebarList title={pageData.labels.maybeYouLike} articles={pageData.relatedPosts} />
        </aside>
      </section>
    </main>
  )
}

function SidebarList({ title, articles }) {
  return (
    <div className="export-market-sidebar-card">
      <h2>{title}</h2>
      <div className="export-market-sidebar-list">
        {articles.map((article) => (
          <Link key={article.id} to={`/export-market/${article.slug}`}>
            <img
              src={article.image}
              alt={`${article.title} thumbnail`}
              loading="lazy"
              decoding="async"
            />
            <span>
              <small>{formatDisplayDate(article.publishedAt)}</small>
              <strong>{article.title}</strong>
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
