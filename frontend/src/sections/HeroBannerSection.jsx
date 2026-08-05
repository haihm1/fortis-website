import { useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Autoplay, Navigation, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { EASE_OUT_EXPO, useMotionSafe } from '../lib/motion'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const MotionDiv = motion.div

/** Copy blocks rise in sequence once their slide becomes active. */
const COPY_STAGGER = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.12 } },
}

const COPY_ITEM = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0 },
}

/* Reduced motion: hero copy is the page's headline content, so it stays painted
   rather than waiting on a frame that may never be served. */
const COPY_STATIC = { hidden: {}, visible: {} }

export function HeroBannerSection({ slides }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const safe = useMotionSafe()
  const sectionRef = useRef(null)

  // Drives both the image drift and the copy fade-out as the hero scrolls away.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  const copyY = useTransform(scrollYProgress, [0, 1], [0, 90])
  const copyOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0])

  const variants = safe ? COPY_ITEM : COPY_STATIC
  const transition = safe
    ? { duration: 0.75, ease: EASE_OUT_EXPO }
    : { duration: 0 }

  return (
    <section className="relative" aria-label="FortisVN hero banner" ref={sectionRef}>
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
        {slides.map((slide, index) => (
          <SwiperSlide key={slide.title}>
            <article className="relative flex w-full min-h-[560px] items-center overflow-hidden lg:min-h-[680px]">
              {/* Scaled past 100% so the parallax drift never uncovers an edge. */}
              <motion.img
                className="absolute inset-0 h-[118%] w-full object-cover"
                style={safe ? { y: imageY, top: '-9%' } : undefined}
                src={slide.image}
                alt={slide.alt}
                fetchPriority={index === 0 ? 'high' : 'auto'}
                loading={index === 0 ? 'eager' : 'lazy'}
                decoding="async"
              />
              <div
                className="absolute inset-0 bg-gradient-to-r from-forest-950/92 via-forest-950/65 to-forest-950/20"
                aria-hidden="true"
              />
              {/* Warms the lower edge so the section below reads as a continuation. */}
              <div
                className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-forest-950/70 to-transparent"
                aria-hidden="true"
              />
              <div className="relative mx-auto w-full max-w-[1240px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
                {/* Copy renders for every slide (not just the active one) so all slides
                    share the tallest slide's height; only opacity and offset animate. */}
                <MotionDiv
                  className="max-w-2xl"
                  style={safe ? { y: copyY, opacity: copyOpacity } : undefined}
                  aria-hidden={activeIndex !== index}
                  inert={activeIndex !== index}
                >
                  <MotionDiv
                    variants={COPY_STAGGER}
                    initial="hidden"
                    animate={activeIndex === index ? 'visible' : 'hidden'}
                  >
                    <MotionDiv variants={variants} transition={transition}>
                      <span className="inline-flex items-center gap-3 text-xs font-semibold tracking-[0.3em] text-gold-300 uppercase">
                        <span className="h-px w-8 bg-gold-400" aria-hidden="true" />
                        {slide.eyebrow}
                      </span>
                    </MotionDiv>
                    <MotionDiv variants={variants} transition={transition}>
                      <h1 className="mt-5 font-display text-4xl leading-[1.08] font-semibold text-white sm:text-5xl lg:text-[3.5rem]">
                        {slide.title}
                      </h1>
                    </MotionDiv>
                    <MotionDiv variants={variants} transition={transition}>
                      <p className="mt-5 max-w-xl text-base leading-relaxed text-white/80 lg:text-lg">
                        {slide.description}
                      </p>
                    </MotionDiv>
                    {slide.overlayLabel ? (
                      <MotionDiv variants={variants} transition={transition}>
                        <span className="mt-5 inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wide text-white/90 ring-1 ring-white/20 backdrop-blur-sm">
                          {slide.overlayLabel}
                        </span>
                      </MotionDiv>
                    ) : null}
                    {slide.facts?.length ? (
                      <MotionDiv
                        className="mt-8 flex flex-wrap gap-x-10 gap-y-4 border-t border-white/20 pt-6"
                        variants={variants}
                        transition={transition}
                      >
                        {slide.facts.slice(0, 3).map((fact) => (
                          <span key={`${fact.label}-${fact.value}`} className="text-sm">
                            <strong className="block font-semibold text-gold-300">{fact.label}</strong>
                            <span className="mt-1 block text-white/75">{fact.value}</span>
                          </span>
                        ))}
                      </MotionDiv>
                    ) : null}
                    <MotionDiv
                      className="mt-9 flex flex-wrap gap-4"
                      variants={variants}
                      transition={transition}
                    >
                      <a
                        className="group inline-flex h-12 cursor-pointer items-center gap-2 rounded-full bg-gold-500 px-7 text-sm font-semibold text-forest-950 transition-all duration-200 hover:bg-gold-400 hover:shadow-[0_8px_28px_rgba(208,165,76,0.4)]"
                        href="#featured-products"
                      >
                        {slide.primaryActionLabel}
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
                      </a>
                      <a
                        className="inline-flex h-12 cursor-pointer items-center rounded-full px-7 text-sm font-semibold text-white ring-1 ring-white/40 backdrop-blur-sm transition-colors duration-200 hover:bg-white/10 hover:ring-white/70"
                        href={slide.secondaryActionHref ?? '#export-market'}
                      >
                        {slide.secondaryActionLabel}
                      </a>
                    </MotionDiv>
                  </MotionDiv>
                </MotionDiv>
              </div>
            </article>
          </SwiperSlide>
        ))}
      </Swiper>

      <ScrollCue />
    </section>
  )
}

/** Nudge at the fold. Decorative, so it is hidden from assistive tech entirely. */
function ScrollCue() {
  const safe = useMotionSafe()

  if (!safe) {
    return null
  }

  return (
    <motion.div
      className="pointer-events-none absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 lg:block"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.4, duration: 0.6 }}
      aria-hidden="true"
    >
      <div className="flex h-10 w-6 items-start justify-center rounded-full ring-1 ring-white/40 p-1.5">
        <motion.span
          className="block h-1.5 w-1 rounded-full bg-gold-300"
          animate={{ y: [0, 12, 0], opacity: [1, 0.2, 1] }}
          transition={{ duration: 1.9, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    </motion.div>
  )
}
