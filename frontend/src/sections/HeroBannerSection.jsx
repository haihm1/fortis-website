import { useState } from 'react'
import { motion } from 'framer-motion'
import { Autoplay, Navigation, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const MotionDiv = motion.div

export function HeroBannerSection({ slides }) {
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <section className="relative" aria-label="FortisVN hero banner">
      <Swiper
        className="fortis-hero-swiper"
        modules={[Autoplay, Navigation, Pagination]}
        slidesPerView={1}
        loop
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5200, disableOnInteraction: false }}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={slide.title}>
            <article className="relative flex w-full min-h-[520px] items-center overflow-hidden lg:min-h-[640px]">
              <img
                className="absolute inset-0 h-full w-full object-cover"
                src={slide.image}
                alt={slide.alt}
                fetchPriority={index === 0 ? 'high' : 'auto'}
                loading={index === 0 ? 'eager' : 'lazy'}
                decoding="async"
              />
              <div
                className="absolute inset-0 bg-gradient-to-r from-forest-950/90 via-forest-950/60 to-forest-950/25"
                aria-hidden="true"
              />
              <div className="relative mx-auto w-full max-w-[1240px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
                {/* Copy is rendered for every slide (not just the active one) so all
                    slides share the tallest slide's height; only opacity is animated. */}
                <MotionDiv
                    className="max-w-2xl"
                    initial={false}
                    animate={activeIndex === index ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    aria-hidden={activeIndex !== index}
                    inert={activeIndex !== index}
                  >
                    <p className="text-xs font-semibold tracking-[0.3em] text-gold-300 uppercase">
                      {slide.eyebrow}
                    </p>
                    <h1 className="mt-4 font-display text-4xl leading-[1.1] font-semibold text-white sm:text-5xl lg:text-6xl">
                      {slide.title}
                    </h1>
                    <p className="mt-5 max-w-xl text-base leading-relaxed text-white/80 lg:text-lg">
                      {slide.description}
                    </p>
                    {slide.overlayLabel ? (
                      <span className="mt-4 inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wide text-white/90 ring-1 ring-white/20">
                        {slide.overlayLabel}
                      </span>
                    ) : null}
                    {slide.facts?.length ? (
                      <div className="mt-8 flex flex-wrap gap-x-10 gap-y-4 border-t border-white/20 pt-6">
                        {slide.facts.slice(0, 3).map((fact) => (
                          <span key={`${fact.label}-${fact.value}`} className="text-sm">
                            <strong className="block font-semibold text-gold-300">{fact.label}</strong>
                            <span className="mt-1 block text-white/75">{fact.value}</span>
                          </span>
                        ))}
                      </div>
                    ) : null}
                    <div className="mt-9 flex flex-wrap gap-4">
                      <a
                        className="inline-flex h-12 cursor-pointer items-center rounded-full bg-gold-500 px-7 text-sm font-semibold text-forest-950 transition-colors duration-200 hover:bg-gold-400"
                        href="#featured-products"
                      >
                        {slide.primaryActionLabel}
                      </a>
                      <a
                        className="inline-flex h-12 cursor-pointer items-center rounded-full px-7 text-sm font-semibold text-white ring-1 ring-white/40 transition-colors duration-200 hover:bg-white/10"
                        href={slide.secondaryActionHref ?? '#export-market'}
                      >
                        {slide.secondaryActionLabel}
                      </a>
                    </div>
                  </MotionDiv>
              </div>
            </article>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  )
}
