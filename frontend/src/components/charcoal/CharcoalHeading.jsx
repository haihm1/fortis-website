import { Reveal } from '../motion/Reveal'
import { SplitText } from '../motion/SplitText'
import { Stagger } from '../motion/Stagger'

/**
 * Section heading in the charcoal palette.
 *
 * SectionHeading is tied to the agricultural forest/gold tokens; rather than adding
 * a third tone branch there, the charcoal site carries its own so each site's
 * headings can drift independently.
 */
export function CharcoalHeading({ eyebrow, title, description, align = 'left', as = 'h2' }) {
  const centered = align === 'center'
  // Sub-pages pass as="h1": the section heading is also the page's only top-level
  // heading there, and a page with no h1 is a real accessibility and SEO gap.
  const isPageTitle = as === 'h1'

  return (
    <Stagger className={`max-w-2xl ${centered ? 'mx-auto text-center' : ''}`} each={0.09}>
      <Reveal child variant="up" duration={0.5}>
        <p
          className={`flex items-center gap-3 text-xs font-semibold tracking-[0.25em] text-ember-400 uppercase ${
            centered ? 'justify-center' : ''
          }`}
        >
          <span className="h-px w-7 bg-ember-500/70" aria-hidden="true" />
          {eyebrow}
        </p>
      </Reveal>

      <SplitText
        as={as}
        text={title}
        className={`mt-3 block font-display leading-tight font-semibold text-white ${
          isPageTitle ? 'text-3xl lg:text-[2.75rem]' : 'text-3xl lg:text-[2.5rem]'
        }`}
      />

      {description ? (
        <Reveal child variant="up" duration={0.55}>
          <p className="mt-4 text-base leading-relaxed text-white/60">{description}</p>
        </Reveal>
      ) : null}
    </Stagger>
  )
}
