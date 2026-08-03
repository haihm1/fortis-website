import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const MotionArticle = motion.article

export function ProductCard({
  product,
  index,
  image,
  isActive,
  labels,
  onSelect,
}) {
  const previewSpecs = (product.specifications ?? []).slice(0, 2)

  return (
    <MotionArticle
      className={`group flex flex-col overflow-hidden rounded-2xl bg-white shadow-card ring-1 transition-shadow duration-300 hover:shadow-card-hover ${
        isActive ? 'ring-2 ring-gold-500' : 'ring-forest-950/5'
      }`}
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, delay: index * 0.055, ease: 'easeOut' }}
      whileHover={{ y: -6 }}
      layout
    >
      <button
        type="button"
        className="cursor-pointer text-left"
        onClick={() => onSelect(product)}
        aria-label={`${labels.selectProduct}: ${product.name}`}
      >
        <span className="relative block aspect-[4/3] overflow-hidden">
          <img
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            src={image}
            alt={`${product.name} thumbnail`}
            loading="lazy"
            decoding="async"
          />
          <span
            className="absolute inset-0 bg-forest-950/0 transition-colors duration-300 group-hover:bg-forest-950/20"
            aria-hidden="true"
          />
        </span>
        <span className="block p-5 pb-0">
          {product.categoryName ? (
            <span className="inline-block rounded-full bg-forest-50 px-2.5 py-1 text-xs font-medium text-forest-800">
              {product.categoryName}
            </span>
          ) : null}
          <strong className="mt-2.5 block font-display text-lg leading-snug font-semibold text-forest-950">
            {product.name}
          </strong>
          {product.summary ? (
            <span className="mt-1.5 line-clamp-2 block text-sm leading-relaxed text-forest-950/60">
              {product.summary}
            </span>
          ) : null}
        </span>
      </button>

      {previewSpecs.length > 0 ? (
        <dl className="mx-5 mt-4 space-y-1.5 border-t border-forest-950/8 pt-4">
          {previewSpecs.map((spec) => (
            <div key={`${spec.label}-${spec.value}`} className="flex gap-2 text-xs">
              <dt className="shrink-0 font-medium text-forest-950/50">{spec.label}:</dt>
              <dd className="text-forest-950/80">{spec.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      <div className="mt-auto flex flex-wrap gap-2.5 p-5">
        <Link
          className="inline-flex h-10 cursor-pointer items-center rounded-full bg-forest-800 px-5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-forest-900"
          to={`/products/${product.slug}`}
        >
          {labels.viewDetail}
        </Link>
        {product.specificationFileUrl ? (
          <a
            className="inline-flex h-10 cursor-pointer items-center rounded-full px-5 text-sm font-semibold text-forest-800 ring-1 ring-forest-800/30 transition-colors duration-200 hover:bg-forest-50"
            href={product.specificationFileUrl}
            target="_blank"
            rel="noreferrer"
          >
            {labels.downloadSpec}
          </a>
        ) : null}
      </div>
    </MotionArticle>
  )
}
