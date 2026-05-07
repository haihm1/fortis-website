export function HeroSection({ company, slides, activeSlide, onSelectSlide }) {
  const currentSlide = slides[activeSlide] ?? slides[0]

  return (
    <section className="hero-section">
      <div className="hero-copy">
        <p className="section-eyebrow">{currentSlide.eyebrow}</p>
        <h2 className="hero-title">{currentSlide.title}</h2>
        <p className="hero-description">{currentSlide.description}</p>

        <div className="hero-actions">
          <a className="primary-button" href="#featured-products">
            {company.primaryActionLabel}
          </a>
          <a className="secondary-button" href="#credentials">
            {company.secondaryActionLabel}
          </a>
        </div>

        <div className="hero-facts" aria-label="Company highlights">
          {currentSlide.facts.map((fact) => (
            <div key={fact.label} className="fact-card">
              <span>{fact.label}</span>
              <strong>{fact.value}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="hero-visual-stack">
        <article
          className="hero-visual"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(8, 31, 22, 0.18), rgba(9, 53, 67, 0.48)), url(${currentSlide.image})`,
          }}
        >
          <div className="hero-overlay-card">
            <span>{company.shortName}</span>
            <strong>{currentSlide.overlayLabel}</strong>
            <p>{company.tagline}</p>
          </div>
        </article>

        <div className="hero-pagination" aria-label="Hero slide navigation">
          {slides.map((slide, index) => (
            <button
              key={slide.title}
              type="button"
              className={index === activeSlide ? 'is-active' : ''}
              onClick={() => onSelectSlide(index)}
            >
              <span>{`${index + 1}`.padStart(2, '0')}</span>
              <span>{slide.eyebrow}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
