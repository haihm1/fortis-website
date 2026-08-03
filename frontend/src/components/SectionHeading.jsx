export function SectionHeading({ eyebrow, title, description, align = 'left' }) {
  return (
    <div className={`max-w-2xl ${align === 'center' ? 'mx-auto text-center' : ''}`}>
      <p className="text-xs font-semibold tracking-[0.25em] text-gold-600 uppercase">{eyebrow}</p>
      <h2 className="mt-3 font-display text-3xl leading-tight font-semibold text-forest-950 lg:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base leading-relaxed text-forest-950/60">{description}</p>
      ) : null}
    </div>
  )
}
