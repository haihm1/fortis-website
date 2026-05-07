import { SectionHeading } from '../components/SectionHeading'

export function FeaturedProductsSection({ section, products }) {
  return (
    <section className="content-section section-muted" id="featured-products">
      <SectionHeading
        eyebrow={section.eyebrow}
        title={section.title}
        description={section.description}
      />

      <div className="card-grid products-grid">
        {products.map((product) => (
          <article key={product.name} className="content-card product-card">
            <div className="product-chip">{product.category}</div>
            <h3>{product.name}</h3>
            <p>{product.summary}</p>

            <dl className="product-meta">
              <div>
                <dt>Grade</dt>
                <dd>{product.grade}</dd>
              </div>
              <div>
                <dt>Common Use</dt>
                <dd>{product.commonUse}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  )
}
