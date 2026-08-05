import { motion, useScroll, useSpring } from 'framer-motion'
import { useMotionSafe } from '../../lib/motion'

// Capitalised alias so no-unused-vars sees a reference (eslint-plugin-react absent).
const MotionDiv = motion.div

/**
 * Hairline reading-progress bar pinned under the sticky header (which owns z-40).
 * Hidden entirely under reduced motion — a bar that tracks scroll is motion by
 * definition, so there is nothing meaningful to degrade it to.
 */
export function ScrollProgress() {
  const safe = useMotionSafe()
  const { scrollYProgress } = useScroll()
  // Spring stops the bar from twitching on trackpads with high-frequency deltas.
  const scaleX = useSpring(scrollYProgress, { stiffness: 180, damping: 30, mass: 0.3 })

  if (!safe) {
    return null
  }

  return (
    <MotionDiv
      className="fixed inset-x-0 top-0 z-[45] h-[3px] origin-left bg-gradient-to-r from-gold-500 via-gold-400 to-forest-400"
      style={{ scaleX }}
      aria-hidden="true"
    />
  )
}
