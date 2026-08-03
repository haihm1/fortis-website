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
    <main>
      <section className="bg-gradient-to-b from-forest-50 to-stone-25">
        <nav
          className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-2 px-4 py-8 text-sm text-forest-950/50 sm:px-6 lg:px-8"
          aria-label="Breadcrumb"
        >
          <Link className="cursor-pointer font-medium text-forest-800 transition-colors hover:text-gold-600" to="/">
            {pageData.labels.breadcrumbHome}
          </Link>
          <span aria-hidden="true">/</span>
          <Link
            className="cursor-pointer font-medium text-forest-800 transition-colors hover:text-gold-600"
            to="/export-market"
          >
            {pageData.labels.breadcrumbCurrent}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="line-clamp-1 max-w-xs">{article.title}</span>
        </nav>
      </section>

      <section className="mx-auto grid max-w-[1240px] items-start gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_320px] lg:px-8 lg:py-14">
        <MotionDiv
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-forest-950/50">
            {article.author ? <span className="font-medium text-forest-950/70">{article.author}</span> : null}
            <span>{formatDisplayDate(article.publishedAt)}</span>
            <span className="h-1 w-1 rounded-full bg-gold-500" aria-hidden="true" />
            <span className="font-medium text-gold-700">{article.category}</span>
          </div>
          <h1 className="mt-3 font-display text-3xl leading-tight font-semibold text-forest-950 lg:text-4xl">
            {article.title}
          </h1>
          <img
            className="mt-6 w-full rounded-2xl object-cover shadow-card"
            src={article.image}
            alt={article.title}
            fetchPriority="high"
            decoding="async"
          />
          <div className="mt-7 space-y-5">
            {article.paragraphs.map((paragraph) => (
              <p key={paragraph} className="text-base leading-relaxed text-forest-950/75">
                {paragraph}
              </p>
            ))}
          </div>
        </MotionDiv>

        <aside className="space-y-5 lg:sticky lg:top-24">
          <SidebarList title={pageData.labels.latestPosts} articles={pageData.latestPosts} />
          <SidebarList title={pageData.labels.maybeYouLike} articles={pageData.relatedPosts} />
        </aside>
      </section>
    </main>
  )
}

function SidebarList({ title, articles }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-forest-950/5">
      <h2 className="text-xs font-semibold tracking-[0.2em] text-forest-950/50 uppercase">{title}</h2>
      <div className="mt-4 space-y-4">
        {articles.map((article) => (
          <Link
            key={article.id}
            className="group flex cursor-pointer gap-3"
            to={`/export-market/${article.slug}`}
          >
            <img
              className="h-16 w-20 shrink-0 rounded-lg object-cover"
              src={article.image}
              alt={`${article.title} thumbnail`}
              loading="lazy"
              decoding="async"
            />
            <span className="min-w-0">
              <small className="block text-xs text-forest-950/45">
                {formatDisplayDate(article.publishedAt)}
              </small>
              <strong className="mt-0.5 line-clamp-2 block text-sm leading-snug font-semibold text-forest-950 transition-colors group-hover:text-forest-700">
                {article.title}
              </strong>
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
