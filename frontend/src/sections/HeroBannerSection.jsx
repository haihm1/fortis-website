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
    <section className="hero-banner-section" aria-label="Fortis VN hero banner">
      <Swiper
        className="hero-banner-swiper"
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
            <article className="hero-banner-slide">
              <img className="hero-banner-image" src={slide.image} alt={slide.alt} />
              <div className="hero-banner-overlay" aria-hidden="true" />
              <div className="hero-banner-content">
                {activeIndex === index ? (
                  <MotionDiv
                    className="hero-banner-copy"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.75, ease: 'easeOut' }}
                  >
                    <p className="section-eyebrow">{slide.eyebrow}</p>
                    <h1>{slide.title}</h1>
                    <p>{slide.description}</p>
                    {slide.overlayLabel ? (
                      <span className="hero-banner-admin-label">{slide.overlayLabel}</span>
                    ) : null}
                    {slide.facts?.length ? (
                      <div className="hero-banner-facts">
                        {slide.facts.slice(0, 3).map((fact) => (
                          <span key={`${fact.label}-${fact.value}`}>
                            <strong>{fact.label}</strong>
                            {fact.value}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    <div className="hero-banner-actions">
                      <a className="primary-button" href="#featured-products">
                        {slide.primaryActionLabel}
                      </a>
                      <a className="secondary-button" href={slide.secondaryActionHref ?? '#export-market'}>
                        {slide.secondaryActionLabel}
                      </a>
                    </div>
                  </MotionDiv>
                ) : null}
              </div>
            </article>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  )
}
