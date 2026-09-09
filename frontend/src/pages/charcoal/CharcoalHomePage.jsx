import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Autoplay, Navigation, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { CharcoalHeading } from '../../components/charcoal/CharcoalHeading'
import { ParallaxImage } from '../../components/motion/ParallaxImage'
import { Reveal } from '../../components/motion/Reveal'
import { Stagger } from '../../components/motion/Stagger'
import { CHARCOAL_CONTENT } from '../../data/charcoalContent'
import { CHARCOAL_MEDIA, CHARCOAL_PRODUCT_IMAGES } from '../../data/charcoalMedia'
import { SEO, buildOrganizationSchema } from '../../data/seoConfig'
import { useJsonLd } from '../../hooks/useJsonLd'
import { useSeoMeta } from '../../hooks/useSeoMeta'
import { brandPath } from '../../lib/brand'
import { EASE_OUT_EXPO, useMotionSafe } from '../../lib/motion'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const MotionDiv = motion.div
const MotionImg = motion.img

const COPY_STAGGER = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
}
const COPY_ITEM = { hidden: { opacity: 0, y: 26 }, visible: { opacity: 1, y: 0 } }
const COPY_STATIC = { hidden: {}, visible: {} }

const HERO_IMAGES = [CHARCOAL_MEDIA.heroEmber, CHARCOAL_MEDIA.heroRaw, CHARCOAL_MEDIA.heroBriquette]

export function CharcoalHomePage({ locale, prefix }) {
  const copy = CHARCOAL_CONTENT[locale] ?? CHARCOAL_CONTENT.en
  const seo = SEO.charcoalHome[locale] ?? SEO.charcoalHome.en

  useSeoMeta({ title: seo.title, description: seo.description, path: seo.path, locale })
  useJsonLd('organization', buildOrganizationSchema())

  return (
    <div className="charcoal-home overflow-x-clip">
      <CharcoalHero copy={copy.hero} prefix={prefix} />
      <IntroSection copy={copy.intro} />
      <StrengthsSection copy={copy.strengths} />
      <ProductsPreview copy={copy.products} prefix={prefix} />
      <ProcessSection copy={copy.process} />
      <PackingSection copy={copy.packing} />
      <MarketsSection copy={copy.markets} />
      <CtaSection copy={copy.cta} prefix={prefix} />
    </div>
  )
}

function CharcoalHero({ copy, prefix }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const safe = useMotionSafe()
  const sectionRef = useRef(null)

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] })
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '16%'])

  const variants = safe ? COPY_ITEM : COPY_STATIC
  const transition = safe ? { duration: 0.7, ease: EASE_OUT_EXPO } : { duration: 0 }

  return (
    <section className="relative" aria-label="Charcoal hero" ref={sectionRef}>
      <Swiper
        className="fortis-hero-swiper"
        modules={[Autoplay, Navigation, Pagination]}
        slidesPerView={1}
        loop
        speed={800}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
      >
        {copy.slides.map((slide, index) => (
          <SwiperSlide key={slide.title}>
            <article className="relative flex w-full min-h-[560px] items-center overflow-hidden lg:min-h-[660px]">
              <MotionImg
                className="absolute inset-0 h-[116%] w-full object-cover"
                style={safe ? { y: imageY, top: '-8%' } : undefined}
                src={HERO_IMAGES[index % HERO_IMAGES.length]}
                alt=""
                fetchPriority={index === 0 ? 'high' : 'auto'}
                loading={index === 0 ? 'eager' : 'lazy'}
                decoding="async"
              />
              <div
                className="absolute inset-0 bg-gradient-to-r from-carbon-950/95 via-carbon-950/75 to-carbon-950/35"
                aria-hidden="true"
              />
              <div className="relative mx-auto w-full max-w-[1240px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
                {/* Copy renders on every slide so all slides share the tallest one's
                    height; only opacity and offset animate. */}
                <MotionDiv
                  className="max-w-2xl"
                  aria-hidden={activeIndex !== index}
                  inert={activeIndex !== index}
                >
                  <MotionDiv
                    variants={COPY_STAGGER}
                    initial="hidden"
                    animate={activeIndex === index ? 'visible' : 'hidden'}
                  >
                    <MotionDiv variants={variants} transition={transition}>
                      <span className="inline-flex items-center gap-3 text-xs font-semibold tracking-[0.3em] text-ember-300 uppercase">
                        <span className="h-px w-8 bg-ember-400" aria-hidden="true" />
                        {slide.eyebrow}
                      </span>
                    </MotionDiv>
                    <MotionDiv variants={variants} transition={transition}>
                      <h1 className="mt-5 font-display text-4xl leading-[1.08] font-semibold text-white sm:text-5xl lg:text-[3.4rem]">
                        {slide.title}
                      </h1>
                    </MotionDiv>
                    <MotionDiv variants={variants} transition={transition}>
                      <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75 lg:text-lg">
                        {slide.description}
                      </p>
                    </MotionDiv>
                    <MotionDiv className="mt-9 flex flex-wrap gap-4" variants={variants} transition={transition}>
                      <Link
                        className="group inline-flex h-12 cursor-pointer items-center gap-2 rounded-full bg-ember-500 px-7 text-sm font-semibold text-white transition-all duration-200 hover:bg-ember-400 hover:shadow-[0_8px_28px_rgba(210,101,31,0.4)]"
                        to={brandPath('/products', prefix)}
                      >
                        {copy.primaryAction}
                        <svg
                          className="transition-transform duration-200 group-hover:translate-x-1"
                          width="14"
                          height="14"
                          viewBox="0 0 16 16"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path d="M3 8h10m0 0L9 4m4 4l-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </Link>
                      <Link
                        className="inline-flex h-12 cursor-pointer items-center rounded-full px-7 text-sm font-semibold text-white ring-1 ring-white/40 backdrop-blur-sm transition-colors duration-200 hover:bg-white/10 hover:ring-white/70"
                        to={brandPath('/contact', prefix)}
                      >
                        {copy.secondaryAction}
                      </Link>
                    </MotionDiv>
                  </MotionDiv>
                </MotionDiv>
              </div>
            </article>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  )
}

function IntroSection({ copy }) {
  return (
    <section className="bg-carbon-900" id="about">
      <div className="mx-auto grid max-w-[1240px] gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:px-8 lg:py-24">
        <div>
          <CharcoalHeading eyebrow={copy.eyebrow} title={copy.title} />
          <Stagger className="mt-6" each={0.08}>
            {copy.paragraphs.map((paragraph) => (
              <Reveal child variant="up" duration={0.6} key={paragraph}>
                <p className="mb-4 text-[0.95rem] leading-relaxed text-white/65 lg:text-base">{paragraph}</p>
              </Reveal>
            ))}
          </Stagger>
        </div>
        <Reveal variant="right" duration={0.75}>
          <ParallaxImage
            className="h-72 w-full rounded-2xl ring-1 ring-white/10 lg:h-full lg:min-h-[380px]"
            src={CHARCOAL_MEDIA.grill}
            alt=""
            strength={30}
            loading="lazy"
            decoding="async"
          />
        </Reveal>
      </div>
    </section>
  )
}

function StrengthsSection({ copy }) {
  return (
    <section className="bg-carbon-950">
      <div className="mx-auto max-w-[1240px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <CharcoalHeading eyebrow={copy.eyebrow} title={copy.title} />
        <Stagger
          className="mt-10 grid gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3"
          each={0.08}
        >
          {copy.items.map((item) => (
            <Reveal
              child
              as="article"
              variant="rise"
              duration={0.6}
              key={item.number}
              className="group relative bg-carbon-950 p-7 transition-colors duration-300 hover:bg-carbon-900 lg:p-8"
            >
              <span
                className="pointer-events-none absolute top-4 right-5 font-display text-6xl font-semibold text-white/5 transition-colors duration-300 group-hover:text-ember-500/20"
                aria-hidden="true"
              >
                {item.number}
              </span>
              <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/5 font-display text-sm font-semibold text-ember-300 ring-1 ring-white/10">
                {item.number}
              </span>
              <h3 className="relative mt-5 font-display text-lg leading-snug font-semibold text-white">
                {item.title}
              </h3>
              <p className="relative mt-3 text-sm leading-relaxed text-white/60">{item.description}</p>
              <span
                className="mt-6 block h-px w-10 bg-ember-500 transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-20"
                aria-hidden="true"
              />
            </Reveal>
          ))}
        </Stagger>
      </div>
    </section>
  )
}

function ProductsPreview({ copy, prefix }) {
  return (
    <section className="bg-carbon-900" id="products">
      <div className="mx-auto max-w-[1240px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <CharcoalHeading eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />
        <Stagger className="mt-10 grid gap-6 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4" each={0.1}>
          {copy.items.map((item, index) => (
            <Reveal
              child
              as="article"
              variant="rise"
              duration={0.65}
              key={item.name}
              className="group flex flex-col overflow-hidden rounded-2xl bg-carbon-950 ring-1 ring-white/10 transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:ring-ember-500/40"
            >
              <span className="block aspect-[4/3] overflow-hidden">
                <img
                  className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  src={CHARCOAL_PRODUCT_IMAGES[index % CHARCOAL_PRODUCT_IMAGES.length]}
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
              </span>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-display text-base leading-snug font-semibold text-white">{item.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-white/55">{item.summary}</p>
                <ul className="mt-4 flex flex-wrap gap-1.5 border-t border-white/10 pt-4">
                  {item.attributes.map((attribute) => (
                    <li
                      className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-white/70"
                      key={`${item.name}-${attribute}`}
                    >
                      {attribute}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </Stagger>
        <Reveal variant="up" duration={0.6} className="mt-10">
          <Link
            className="group inline-flex items-center gap-2 text-sm font-semibold text-ember-400 transition-colors hover:text-ember-300"
            to={brandPath('/products', prefix)}
          >
            {copy.eyebrow}
            <svg
              className="transition-transform duration-200 group-hover:translate-x-1"
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path d="M3 8h10m0 0L9 4m4 4l-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </Reveal>
      </div>
    </section>
  )
}

function ProcessSection({ copy }) {
  return (
    <section className="bg-carbon-950" id="process">
      <div className="mx-auto max-w-[1240px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <CharcoalHeading eyebrow={copy.eyebrow} title={copy.title} />
        <Stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3" each={0.09}>
          {copy.steps.map((step, index) => (
            <Reveal
              child
              as="article"
              variant="rise"
              duration={0.6}
              key={step.title}
              className="group relative overflow-hidden rounded-2xl bg-carbon-900 p-6 ring-1 ring-white/10 transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:ring-ember-500/40"
            >
              <span
                className="pointer-events-none absolute -top-2 right-4 font-display text-6xl font-semibold text-white/5 transition-colors duration-300 group-hover:text-ember-500/20"
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-ember-500 font-display text-sm font-semibold text-white">
                {index + 1}
              </span>
              <h3 className="relative mt-4 font-display text-base font-semibold text-white">{step.title}</h3>
              <p className="relative mt-2 text-sm leading-relaxed text-white/55">{step.description}</p>
            </Reveal>
          ))}
        </Stagger>
      </div>
    </section>
  )
}

function PackingSection({ copy }) {
  return (
    <section className="bg-carbon-900">
      <div className="mx-auto grid max-w-[1240px] gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:px-8 lg:py-24">
        <Reveal variant="left" duration={0.75}>
          <ParallaxImage
            className="h-64 w-full rounded-2xl ring-1 ring-white/10 lg:h-full lg:min-h-[340px]"
            src={CHARCOAL_MEDIA.kiln}
            alt=""
            strength={28}
            loading="lazy"
            decoding="async"
          />
        </Reveal>
        <div>
          <CharcoalHeading eyebrow={copy.eyebrow} title={copy.title} />
          <Stagger className="mt-6" each={0.08}>
            {copy.paragraphs.map((paragraph) => (
              <Reveal child variant="up" duration={0.6} key={paragraph}>
                <p className="mb-4 text-[0.95rem] leading-relaxed text-white/65">{paragraph}</p>
              </Reveal>
            ))}
            <Reveal child variant="up" duration={0.6}>
              <p className="mt-2 rounded-xl bg-white/5 px-4 py-3 text-xs leading-relaxed text-white/45 ring-1 ring-white/10">
                {copy.note}
              </p>
            </Reveal>
          </Stagger>
        </div>
      </div>
    </section>
  )
}

function MarketsSection({ copy }) {
  return (
    <section className="bg-carbon-950">
      <div className="mx-auto max-w-[1240px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <CharcoalHeading eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />
        <Stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3" each={0.08}>
          {copy.items.map((market) => (
            <Reveal
              child
              variant="rise"
              duration={0.6}
              key={market}
              className="group flex items-center gap-4 rounded-2xl bg-carbon-900 p-5 ring-1 ring-white/10 transition-all duration-300 hover:ring-ember-500/40"
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full bg-ember-400 transition-transform duration-300 group-hover:scale-150"
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

function CtaSection({ copy, prefix }) {
  return (
    <section className="relative overflow-hidden bg-carbon-800">
      <div
        className="fortis-float pointer-events-none absolute -bottom-24 -left-20 h-80 w-80 rounded-full bg-ember-700/20 blur-3xl"
        aria-hidden="true"
      />
      <Stagger className="relative mx-auto max-w-[1240px] px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-20" each={0.1}>
        <Reveal child variant="up" duration={0.65}>
          <h2 className="mx-auto max-w-2xl font-display text-2xl leading-snug font-semibold text-white lg:text-3xl">
            {copy.title}
          </h2>
        </Reveal>
        <Reveal child variant="up" duration={0.65}>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/60">{copy.description}</p>
        </Reveal>
        <Reveal child variant="up" duration={0.65}>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Link
              className="inline-flex h-12 cursor-pointer items-center rounded-full bg-ember-500 px-7 text-sm font-semibold text-white transition-all duration-200 hover:bg-ember-400 hover:shadow-[0_8px_28px_rgba(210,101,31,0.35)]"
              to={brandPath('/contact', prefix)}
            >
              {copy.primary}
            </Link>
            <a
              className="inline-flex h-12 cursor-pointer items-center gap-2 rounded-full px-7 text-sm font-semibold text-white ring-1 ring-white/40 transition-colors duration-200 hover:bg-white/10 hover:ring-white/70"
              href="/company-profile.pdf"
              download="PROFILE-FORTISVN.pdf"
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 2v8m0 0L5 7m3 3l3-3M3 13h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {copy.secondary}
            </a>
          </div>
        </Reveal>
      </Stagger>
    </section>
  )
}
