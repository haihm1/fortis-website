import { SectionHeading } from '../components/SectionHeading'

export function CoreValuesSection({ section, values }) {
  return (
    <section className="content-section" id="core-values">
      <SectionHeading
        eyebrow={section.eyebrow}
        title={section.title}
        description={section.description}
      />

      <div className="card-grid values-grid">
        {values.map((value) => (
          <article key={value.title} className="content-card value-card">
            <span className="card-highlight">{value.highlight}</span>
            <h3>{value.title}</h3>
            <p>{value.description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
