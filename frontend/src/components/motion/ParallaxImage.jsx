import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useMotionSafe } from '../../lib/motion'

// Aliased to a capitalised binding: eslint-plugin-react is not installed, so JSX
// usage alone does not count as a reference (see varsIgnorePattern in eslint.config.js).
const MotionImg = motion.img

/**
 * Image that drifts slower than the page as its container scrolls past.
 *
 * The element is over-sized by `strength * 2` px vertically and inset by half of
 * that, so the drift never exposes an edge. Under reduced motion it renders as a
 * plain img with no wrapper transform.
 */
export function ParallaxImage({
  src,
  alt,
  className = '',
  imgClassName = '',
  strength = 60,
  ...imgProps
}) {
  const safe = useMotionSafe()
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], [-strength, strength])

  if (!safe) {
    return (
      <div className={`overflow-hidden ${className}`}>
        <img className={`h-full w-full object-cover ${imgClassName}`} src={src} alt={alt} {...imgProps} />
      </div>
    )
  }

  return (
    <div className={`overflow-hidden ${className}`} ref={containerRef}>
      <MotionImg
        className={`w-full object-cover ${imgClassName}`}
        style={{ y, height: `calc(100% + ${strength * 2}px)`, marginTop: -strength }}
        src={src}
        alt={alt}
        {...imgProps}
      />
    </div>
  )
}
