import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PageLoading } from '../components/PageLoading'
import { useBackendData } from '../hooks/useBackendData'
import { useJsonLd } from '../hooks/useJsonLd'
import { useSeoMeta } from '../hooks/useSeoMeta'
import { buildOrganizationSchema } from '../data/seoConfig'
import { loadExportMarket } from '../services/exportMarketApi'
import { formatDisplayDate } from '../utils/dateFormat'

const MotionArticle = motion.article

export function ExportMarketPage({ locale }) {
  const pageData = useBackendData((signal) => loadExportMarket(locale, signal), [locale])

  const featuredArticle = useMemo(
    () => pageData?.articles?.find((article) => article.featured) ?? pageData?.articles?.[0],
    [pageData],
  )
  const listArticles = pageData?.articles?.filter((article) => article.id !== featuredArticle?.id) ?? []

  useSeoMeta({
    title: pageData?.pageHeader.title ?? '',
    description: pageData?.pageHeader.description ?? '',
    path: '/export-market',
    locale,
  })
  useJsonLd('organization', buildOrganizationSchema())

  if (!pageData) {
    return <PageLoading locale={locale} />
  }

  return (
    <main>
      <section className="bg-gradient-to-b from-forest-50 to-stone-25">
        <div className="mx-auto max-w-[1240px] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <nav className="flex items-center gap-2 text-sm text-forest-950/50" aria-label="Breadcrumb">
            <Link className="cursor-pointer font-medium text-forest-800 transition-colors hover:text-gold-600" to="/">
              {pageData.labels.breadcrumbHome}
            </Link>
            <span aria-hidden="true">/</span>
            <span>{pageData.labels.breadcrumbCurrent}</span>
          </nav>
          <p className="mt-5 text-xs font-semibold tracking-[0.25em] text-gold-600 uppercase">
            {pageData.pageHeader.eyebrow}
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-3xl leading-tight font-semibold text-forest-950 lg:text-5xl">
            {pageData.pageHeader.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-forest-950/60">
            {pageData.pageHeader.description}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] space-y-10 px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
        {featuredArticle ? (
          <MotionArticle
            className="group grid overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-forest-950/5 transition-shadow duration-300 hover:shadow-card-hover lg:grid-cols-2"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              to={`/export-market/${featuredArticle.slug}`}
              className="block cursor-pointer overflow-hidden"
            >
              <img
                className="aspect-[16/10] h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                src={featuredArticle.image}
                alt={`${featuredArticle.title} thumbnail`}
                loading="lazy"
                decoding="async"
              />
            </Link>
            <div className="flex flex-col justify-center p-6 lg:p-10">
              <ArticleMeta article={featuredArticle} />
              <h2 className="mt-3 font-display text-2xl leading-snug font-semibold text-forest-950 lg:text-3xl">
                <Link
                  className="cursor-pointer transition-colors hover:text-forest-700"
                  to={`/export-market/${featuredArticle.slug}`}
                >
                  {featuredArticle.title}
                </Link>
              </h2>
              <p className="mt-4 line-clamp-4 text-sm leading-relaxed text-forest-950/65 lg:text-base">
                {featuredArticle.excerpt}
              </p>
              <Link
                className="mt-7 inline-flex h-11 cursor-pointer items-center self-start rounded-full bg-forest-800 px-6 text-sm font-semibold text-white transition-colors hover:bg-forest-900"
                to={`/export-market/${featuredArticle.slug}`}
              >
                {pageData.labels.readMore}
              </Link>
            </div>
          </MotionArticle>
        ) : null}

        {pageData.articles.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center text-sm text-forest-950/60 shadow-card ring-1 ring-forest-950/5">
            {pageData.labels.noArticles}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-forest-950/5 transition-shadow duration-300 hover:shadow-card-hover"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, delay: index * 0.06 }}
    >
      <Link className="block cursor-pointer overflow-hidden" to={`/export-market/${article.slug}`}>
        <img
          className="aspect-[16/10] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          src={article.image}
          alt={`${article.title} thumbnail`}
          loading="lazy"
          decoding="async"
        />
      </Link>
      <div className="flex flex-1 flex-col p-5 lg:p-6">
        <ArticleMeta article={article} />
        <h2 className="mt-2.5 font-display text-lg leading-snug font-semibold text-forest-950">
          <Link
            className="cursor-pointer transition-colors hover:text-forest-700"
            to={`/export-market/${article.slug}`}
          >
            {article.title}
          </Link>
        </h2>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-forest-950/60">{article.excerpt}</p>
        <Link
          className="mt-auto inline-flex cursor-pointer items-center gap-1.5 pt-4 text-sm font-semibold text-gold-600 transition-colors hover:text-gold-700"
          to={`/export-market/${article.slug}`}
        >
          {readMoreLabel}
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8h10m0 0L9 4m4 4l-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </MotionArticle>
  )
}

function ArticleMeta({ article }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-forest-950/50">
      <span>{formatDisplayDate(article.publishedAt)}</span>
      <span className="h-1 w-1 rounded-full bg-gold-500" aria-hidden="true" />
      <span className="font-medium text-gold-700">{article.category}</span>
    </div>
  )
}
