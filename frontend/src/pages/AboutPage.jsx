import { Link } from 'react-router-dom'
import { SectionHeading } from '../components/SectionHeading'
import { Reveal } from '../components/motion/Reveal'
import { Stagger } from '../components/motion/Stagger'
import { ABOUT_CONTENT } from '../data/aboutContent'
import { SEO, buildOrganizationSchema } from '../data/seoConfig'
import { useJsonLd } from '../hooks/useJsonLd'
import { useSeoMeta } from '../hooks/useSeoMeta'

/* Each photo was opened and checked before being used here — an Unsplash ID says
   nothing about its subject, and a wrong one ships a stock photo that contradicts
   the copy next to it. */
const MEDIA = {
  hero: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1920&q=85',
  // Farmer working a field with coconut palms behind — matches the letter's theme
  // of accompanying growers.
  letter: 'https://images.unsplash.com/photo-1771684512366-791db391ab4e?auto=format&fit=crop&w=1200&q=85',
  // Coconut plantation stretching to the sea, for the brand story's "fertile lands
  // of the Southwest where coconut trees thrive under sun and wind".
  brand: 'https://images.unsplash.com/photo-1783112054020-68aaa816ac54?auto=format&fit=crop&w=1200&q=85',
}

/**
 * Company introduction, built from PROFILE-FORTISVN.pdf. All copy lives in
 * ABOUT_CONTENT rather than the backend: the profile is a fixed document, not
 * something the admin area currently manages.
 */
export function AboutPage({ locale }) {
  const copy = ABOUT_CONTENT[locale] ?? ABOUT_CONTENT.en
  const seo = SEO.about[locale] ?? SEO.about.en

  useSeoMeta({ title: seo.title, description: seo.description, path: seo.path, locale })
  useJsonLd('organization', buildOrganizationSchema())

  return (
    <main className="about-page overflow-x-clip">
      <AboutHero copy={copy} />
      <OpenLetterSection copy={copy.letter} />
      <CompanySection copy={copy.company} />
      <BrandStorySection copy={copy.brand} />
      <VisionSection copy={copy.vision} />
      <ActivitiesSection copy={copy.activities} />
      <SupplyChainSection copy={copy.supplyChain} />
      <CapabilitiesSection copy={copy.capabilities} />
      <MarketsSection copy={copy.markets} />
      <CommitmentsSection copy={copy.commitments} />
      <CtaSection copy={copy.cta} />
    </main>
  )
}

function AboutHero({ copy }) {
  return (
    <section className="relative flex min-h-[440px] items-center overflow-hidden lg:min-h-[540px]">
      <img
        className="absolute inset-0 h-full w-full object-cover"
        src={MEDIA.hero}
        alt="FortisVN export operations"
        fetchPriority="high"
        decoding="async"
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-forest-950/92 via-forest-950/70 to-forest-950/30"
        aria-hidden="true"
      />
      <Stagger className="relative mx-auto w-full max-w-[1240px] px-4 py-20 sm:px-6 lg:px-8 lg:py-28" each={0.1}>
        <Reveal child variant="up" duration={0.6}>
          <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.3em] text-gold-300 uppercase">
            <span className="h-px w-8 bg-gold-400" aria-hidden="true" />
            {copy.eyebrow}
          </p>
        </Reveal>
        <Reveal child variant="up" duration={0.7}>
          <h1 className="mt-5 max-w-3xl font-display text-4xl leading-[1.1] font-semibold text-white sm:text-5xl lg:text-[3.25rem]">
            {copy.title}
          </h1>
        </Reveal>
        <Reveal child variant="up" duration={0.7}>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/80 lg:text-lg">{copy.intro}</p>
        </Reveal>
        <Reveal child variant="up" duration={0.7}>
          <p className="mt-7 inline-block rounded-full bg-white/10 px-5 py-2 text-sm font-medium text-gold-200 ring-1 ring-white/20 backdrop-blur-sm">
            {copy.positioning}
          </p>
        </Reveal>
      </Stagger>
    </section>
  )
}

function OpenLetterSection({ copy }) {
  return (
    <section className="bg-stone-25">
      <div className="mx-auto grid max-w-[1240px] gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 lg:px-8 lg:py-24">
        <Reveal variant="left" duration={0.7} className="relative">
          <img
            className="h-64 w-full rounded-2xl object-cover shadow-card lg:sticky lg:top-28 lg:h-[420px]"
            src={MEDIA.letter}
            alt="Vietnamese coconut growing region"
            loading="lazy"
            decoding="async"
          />
        </Reveal>
        <Stagger each={0.08}>
          <Reveal child variant="up" duration={0.55}>
            <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.25em] text-gold-600 uppercase">
              <span className="h-px w-7 bg-gold-500/60" aria-hidden="true" />
              {copy.eyebrow}
            </p>
          </Reveal>
          <Reveal child variant="up" duration={0.6}>
            <h2 className="mt-3 font-display text-2xl leading-snug font-semibold text-forest-950 lg:text-3xl">
              {copy.title}
            </h2>
          </Reveal>
          {copy.paragraphs.map((paragraph) => (
            <Reveal child variant="up" duration={0.6} key={paragraph}>
              <p className="mt-5 text-[0.95rem] leading-relaxed text-forest-950/70 lg:text-base">{paragraph}</p>
            </Reveal>
          ))}
          <Reveal child variant="up" duration={0.6}>
            <div className="mt-8 border-t border-forest-950/10 pt-6">
              <p className="text-sm text-forest-950/60">{copy.signOff}</p>
              <p className="mt-1 font-display text-base font-semibold text-forest-950">{copy.signature}</p>
            </div>
          </Reveal>
        </Stagger>
      </div>
    </section>
  )
}

function CompanySection({ copy }) {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1240px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <SectionHeading eyebrow={copy.eyebrow} title={copy.title} />
        <Stagger className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16" each={0.1}>
          <Reveal child variant="up" duration={0.65}>
            {copy.paragraphs.map((paragraph) => (
              <p className="mb-4 text-base leading-relaxed text-forest-950/70" key={paragraph}>
                {paragraph}
              </p>
            ))}
          </Reveal>
          <Reveal child variant="up" duration={0.7}>
            <dl className="divide-y divide-forest-950/8 rounded-2xl bg-stone-25 p-6 ring-1 ring-forest-950/5 lg:p-8">
              {copy.facts.map((fact) => (
                <div className="py-4 first:pt-0 last:pb-0" key={fact.label}>
                  <dt className="text-xs font-semibold tracking-[0.15em] text-gold-600 uppercase">
                    {fact.label}
                  </dt>
                  <dd className="mt-2 text-sm leading-relaxed text-forest-950/80">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </Stagger>
      </div>
    </section>
  )
}

function BrandStorySection({ copy }) {
  return (
    <section className="relative overflow-hidden bg-forest-950">
      <div
        className="fortis-float pointer-events-none absolute -top-24 -right-20 h-80 w-80 rounded-full bg-forest-700/25 blur-3xl"
        aria-hidden="true"
      />
      <div className="relative mx-auto grid max-w-[1240px] gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:px-8 lg:py-24">
        <Stagger each={0.08}>
          <Reveal child variant="up" duration={0.55}>
            <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.25em] text-gold-400 uppercase">
              <span className="h-px w-7 bg-gold-400/70" aria-hidden="true" />
              {copy.eyebrow}
            </p>
          </Reveal>
          <Reveal child variant="up" duration={0.6}>
            <h2 className="mt-3 font-display text-3xl leading-tight font-semibold text-white lg:text-[2.5rem]">
              {copy.title}
            </h2>
          </Reveal>
          {copy.paragraphs.map((paragraph) => (
            <Reveal child variant="up" duration={0.6} key={paragraph}>
              <p className="mt-5 text-[0.95rem] leading-relaxed text-white/70 lg:text-base">{paragraph}</p>
            </Reveal>
          ))}
          <Reveal child variant="up" duration={0.65}>
            <blockquote className="mt-7 border-l-2 border-gold-400 pl-6">
              <p className="font-display text-xl leading-snug font-semibold text-gold-200 lg:text-2xl">
                “{copy.quote}”
              </p>
            </blockquote>
          </Reveal>
          <Reveal child variant="up" duration={0.6}>
            <p className="mt-6 text-[0.95rem] leading-relaxed text-white/70 lg:text-base">{copy.closing}</p>
          </Reveal>
        </Stagger>
        <Reveal variant="right" duration={0.75}>
          <img
            className="h-72 w-full rounded-2xl object-cover ring-1 ring-white/10 lg:h-full lg:max-h-[520px]"
            src={MEDIA.brand}
            alt="Coconut palms in the Mekong Delta"
            loading="lazy"
            decoding="async"
          />
        </Reveal>
      </div>
    </section>
  )
}

function VisionSection({ copy }) {
  return (
    <section className="bg-stone-25">
      <div className="mx-auto max-w-[1240px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <SectionHeading eyebrow={copy.eyebrow} title={copy.title} />
        <Stagger className="mt-10 grid gap-6 lg:mt-14 lg:grid-cols-3" each={0.1}>
          <Reveal
            child
            as="article"
            variant="rise"
            duration={0.65}
            className="rounded-2xl bg-white p-7 shadow-card ring-1 ring-forest-950/5 lg:p-8"
          >
            <h3 className="font-display text-lg font-semibold text-forest-950">{copy.visionLabel}</h3>
            <span className="mt-3 block h-px w-10 bg-gold-500" aria-hidden="true" />
            <p className="mt-5 text-sm leading-relaxed text-forest-950/70">{copy.visionText}</p>
          </Reveal>

          <Reveal
            child
            as="article"
            variant="rise"
            duration={0.65}
            className="rounded-2xl bg-white p-7 shadow-card ring-1 ring-forest-950/5 lg:p-8"
          >
            <h3 className="font-display text-lg font-semibold text-forest-950">{copy.missionLabel}</h3>
            <span className="mt-3 block h-px w-10 bg-gold-500" aria-hidden="true" />
            <ul className="mt-5 space-y-3">
              {copy.missionItems.map((item) => (
                <li className="flex gap-3 text-sm leading-relaxed text-forest-950/70" key={item}>
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal
            child
            as="article"
            variant="rise"
            duration={0.65}
            className="rounded-2xl bg-forest-950 p-7 ring-1 ring-forest-950/5 lg:p-8"
          >
            <h3 className="font-display text-lg font-semibold text-white">{copy.valuesLabel}</h3>
            <span className="mt-3 block h-px w-10 bg-gold-400" aria-hidden="true" />
            <ol className="mt-5 space-y-3">
              {copy.values.map((value, index) => (
                <li className="flex gap-3 text-sm leading-relaxed text-white/75" key={value}>
                  <span className="font-display text-xs font-semibold text-gold-400">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {value}
                </li>
              ))}
            </ol>
          </Reveal>
        </Stagger>
      </div>
    </section>
  )
}

function ActivitiesSection({ copy }) {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1240px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <SectionHeading eyebrow={copy.eyebrow} title={copy.title} />
        <Stagger className="mt-10 grid gap-px overflow-hidden rounded-2xl bg-forest-950/8 lg:mt-14 lg:grid-cols-3" each={0.1}>
          {copy.items.map((item) => (
            <Reveal
              child
              as="article"
              variant="rise"
              duration={0.65}
              key={item.number}
              className="group bg-white p-7 transition-colors duration-300 hover:bg-stone-25 lg:p-9"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-forest-50 font-display text-sm font-semibold text-forest-700 ring-1 ring-forest-950/5">
                {item.number}
              </span>
              <h3 className="mt-5 font-display text-lg leading-snug font-semibold text-forest-950">
                {item.title}
              </h3>
              {item.paragraphs?.map((paragraph) => (
                <p className="mt-3 text-sm leading-relaxed text-forest-950/65" key={paragraph}>
                  {paragraph}
                </p>
              ))}
              {item.bullets?.length ? (
                <ul className="mt-4 space-y-2 border-t border-forest-950/8 pt-4">
                  {item.bullets.map((bullet) => (
                    <li className="flex gap-2.5 text-sm leading-relaxed text-forest-950/70" key={bullet}>
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" aria-hidden="true" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              ) : null}
              <span
                className="mt-6 block h-px w-10 bg-gold-500 transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-20"
                aria-hidden="true"
              />
            </Reveal>
          ))}
        </Stagger>
      </div>
    </section>
  )
}

function SupplyChainSection({ copy }) {
  return (
    <section className="bg-stone-25">
      <div className="mx-auto max-w-[1240px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <SectionHeading eyebrow={copy.eyebrow} title={copy.title} />
        <Stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3" each={0.09}>
          {copy.steps.map((step, index) => (
            <Reveal
              child
              as="article"
              variant="rise"
              duration={0.6}
              key={step}
              className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-card ring-1 ring-forest-950/5 transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-card-hover"
            >
              <span
                className="pointer-events-none absolute -top-2 right-4 font-display text-6xl font-semibold text-forest-950/5 transition-colors duration-300 group-hover:text-gold-500/15"
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-gold-500 font-display text-sm font-semibold text-forest-950">
                {index + 1}
              </span>
              <p className="relative mt-4 text-sm leading-relaxed font-medium text-forest-950/80">{step}</p>
            </Reveal>
          ))}
        </Stagger>
      </div>
    </section>
  )
}

function CapabilitiesSection({ copy }) {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1240px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <SectionHeading eyebrow={copy.eyebrow} title={copy.title} />
        <Stagger className="mt-10 space-y-5 lg:mt-14" each={0.12}>
          {copy.items.map((item) => (
            <Reveal
              child
              as="article"
              variant="up"
              duration={0.65}
              key={item.number}
              className="grid gap-5 rounded-2xl bg-stone-25 p-7 ring-1 ring-forest-950/5 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10 lg:p-9"
            >
              <div className="flex gap-5">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest-950 font-display text-base font-semibold text-gold-300">
                  {item.number}
                </span>
                <h3 className="font-display text-lg leading-snug font-semibold text-forest-950 lg:text-xl">
                  {item.title}
                </h3>
              </div>
              <div>
                {item.description ? (
                  <p className="text-sm leading-relaxed text-forest-950/65">{item.description}</p>
                ) : null}
                <ul className={`space-y-2.5 ${item.description ? 'mt-4' : ''}`}>
                  {item.bullets.map((bullet) => (
                    <li className="flex gap-2.5 text-sm leading-relaxed text-forest-950/75" key={bullet}>
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" aria-hidden="true" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </Stagger>
      </div>
    </section>
  )
}

function MarketsSection({ copy }) {
  return (
    <section className="bg-forest-950">
      <div className="mx-auto max-w-[1240px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <SectionHeading eyebrow={copy.eyebrow} title={copy.title} description={copy.description} tone="dark" />
        <Stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3" each={0.08}>
          {copy.items.map((market) => (
            <Reveal
              child
              variant="rise"
              duration={0.6}
              key={market}
              className="group flex items-center gap-4 rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 transition-all duration-300 hover:bg-white/[0.08] hover:ring-gold-400/30"
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full bg-gold-400 transition-transform duration-300 group-hover:scale-150"
                aria-hidden="true"
              />
              <span className="font-display text-base font-medium text-white">{market}</span>
            </Reveal>
          ))}
        </Stagger>
      </div>
    </section>
  )
}

function CommitmentsSection({ copy }) {
  return (
    <section className="bg-stone-25">
      <div className="mx-auto max-w-[1240px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <SectionHeading eyebrow={copy.eyebrow} title={copy.title} />
        <Stagger className="mt-10 space-y-3 lg:mt-14" each={0.08}>
          {copy.items.map((item) => (
            <Reveal
              child
              as="article"
              variant="left"
              duration={0.6}
              key={item.number}
              className="group flex gap-5 rounded-2xl bg-white p-6 shadow-card ring-1 ring-forest-950/5 transition-all duration-300 hover:ring-gold-500/25 lg:p-7"
            >
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-forest-950 font-display text-sm font-semibold text-gold-300 transition-colors duration-300 group-hover:bg-forest-800">
                {item.number}
              </span>
              <div>
                <h3 className="font-display text-base font-semibold text-forest-950">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-forest-950/65">{item.description}</p>
              </div>
            </Reveal>
          ))}
        </Stagger>
      </div>
    </section>
  )
}

function CtaSection({ copy }) {
  return (
    <section className="relative overflow-hidden bg-forest-900">
      <div
        className="fortis-float pointer-events-none absolute -bottom-24 -left-20 h-80 w-80 rounded-full bg-gold-700/15 blur-3xl"
        aria-hidden="true"
      />
      <Stagger className="relative mx-auto max-w-[1240px] px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-20" each={0.1}>
        <Reveal child variant="up" duration={0.65}>
          <h2 className="mx-auto max-w-3xl font-display text-2xl leading-snug font-semibold text-white lg:text-3xl">
            {copy.title}
          </h2>
        </Reveal>
        <Reveal child variant="up" duration={0.65}>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <a
              className="group inline-flex h-12 cursor-pointer items-center gap-2 rounded-full bg-gold-500 px-7 text-sm font-semibold text-forest-950 transition-all duration-200 hover:bg-gold-400 hover:shadow-[0_8px_28px_rgba(208,165,76,0.35)]"
              href="/company-profile.pdf"
              download="PROFILE-FORTISVN.pdf"
            >
              <svg
                className="transition-transform duration-200 group-hover:translate-y-0.5"
                width="15"
                height="15"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path d="M8 2v8m0 0L5 7m3 3l3-3M3 13h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {copy.profileButton}
            </a>
            <Link
              className="inline-flex h-12 cursor-pointer items-center rounded-full px-7 text-sm font-semibold text-white ring-1 ring-white/40 transition-colors duration-200 hover:bg-white/10 hover:ring-white/70"
              to="/contact"
            >
              {copy.contactButton}
            </Link>
          </div>
        </Reveal>
      </Stagger>
    </section>
  )
}
