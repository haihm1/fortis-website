import { Reveal } from './motion/Reveal'
import { SplitText } from './motion/SplitText'
import { Stagger } from './motion/Stagger'

export function SectionHeading({ eyebrow, title, description, align = 'left', tone = 'light' }) {
  const centered = align === 'center'
  const isDark = tone === 'dark'

  return (
    <Stagger
      className={`max-w-2xl ${centered ? 'mx-auto text-center' : ''}`}
      each={0.09}
    >
      <Reveal child variant="up" duration={0.5}>
        <p
          className={`flex items-center gap-3 text-xs font-semibold tracking-[0.25em] uppercase ${
            centered ? 'justify-center' : ''
          } ${isDark ? 'text-gold-400' : 'text-gold-600'}`}
        >
          <span className={`h-px w-7 ${isDark ? 'bg-gold-400/70' : 'bg-gold-500/60'}`} aria-hidden="true" />
          {eyebrow}
        </p>
      </Reveal>

      <SplitText
        as="h2"
        text={title}
        className={`mt-3 block font-display text-3xl leading-tight font-semibold lg:text-[2.5rem] ${
          isDark ? 'text-white' : 'text-forest-950'
        }`}
      />

      {description ? (
        <Reveal child variant="up" duration={0.55}>
          <p
            className={`mt-4 text-base leading-relaxed ${
              isDark ? 'text-white/65' : 'text-forest-950/60'
            }`}
          >
            {description}
          </p>
        </Reveal>
      ) : null}
    </Stagger>
  )
}
