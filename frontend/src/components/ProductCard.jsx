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
      className={`b2b-product-card ${isActive ? 'is-active' : ''}`}
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, delay: index * 0.055, ease: 'easeOut' }}
      whileHover={{ y: -6 }}
      layout
    >
      <button
        type="button"
        className="b2b-product-select"
        onClick={() => onSelect(product)}
        aria-label={`${labels.selectProduct}: ${product.name}`}
      >
        <span className="b2b-product-image-frame">
          <img
            className="b2b-product-image"
            src={image}
            alt={`${product.name} thumbnail`}
            loading="lazy"
            decoding="async"
          />
          <span className="b2b-product-overlay" aria-hidden="true" />
          <span className="b2b-product-hover-action">{labels.viewDetail}</span>
        </span>
        <span className="b2b-product-body">
          <span className="product-chip">{product.categoryName}</span>
          <strong>{product.name}</strong>
          <span>{product.summary}</span>
        </span>
      </button>

      <dl className="b2b-product-specs">
        {previewSpecs.map((spec) => (
          <div key={`${spec.label}-${spec.value}`}>
            <dt>{spec.label}</dt>
            <dd>{spec.value}</dd>
          </div>
        ))}
      </dl>

      <div className="b2b-product-actions">
        <Link className="primary-button" to={`/products/${product.slug}`}>
          {labels.viewDetail}
        </Link>
        {product.specificationFileUrl ? (
          <a
            className="secondary-button"
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
