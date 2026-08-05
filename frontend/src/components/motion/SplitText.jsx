import { motion } from 'framer-motion'
import { EASE_OUT_EXPO, VIEWPORT, useMotionSafe } from '../../lib/motion'

// Capitalised alias so no-unused-vars sees a reference (eslint-plugin-react absent).
const MotionSpan = motion.span

const CONTAINER = {
  hidden: {},
  visible: (custom) => ({
    transition: { staggerChildren: custom.each, delayChildren: custom.delay },
  }),
}

const WORD = {
  hidden: { y: '110%' },
  visible: { y: '0%' },
}

/**
 * Reveals a headline word by word, each word rising out of its own clipped line.
 *
 * The visible spans are aria-hidden and the real string is exposed via aria-label,
 * so assistive tech reads one uninterrupted sentence rather than N fragments.
 * Under reduced motion the splitting is skipped entirely and plain text renders.
 */
export function SplitText({ as = 'span', text, className, delay = 0, each = 0.045 }) {
  const safe = useMotionSafe()
  // Assigned to a capitalised *variable* (not a param) so varsIgnorePattern applies.
  const Component = as
  const value = String(text ?? '')

  if (!safe || !value) {
    return <Component className={className}>{value}</Component>
  }

  const words = value.split(/\s+/).filter(Boolean)

  return (
    <Component className={className} aria-label={value}>
      <MotionSpan
        aria-hidden="true"
        custom={{ each, delay }}
        variants={CONTAINER}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT}
      >
        {words.map((word, index) => (
          /*
           * Words repeat inside a headline so the index has to be part of the key.
           * The inter-word gap is a right margin rather than a literal space: a
           * space placed inside the clipping span is swallowed by overflow-hidden.
           */
          <span
            className="inline-block overflow-hidden pb-[0.08em] align-bottom"
            key={`${word}-${index}`}
            style={index < words.length - 1 ? { marginRight: '0.26em' } : undefined}
          >
            <MotionSpan
              className="inline-block"
              variants={WORD}
              transition={{ duration: 0.75, ease: EASE_OUT_EXPO }}
            >
              {word}
            </MotionSpan>
          </span>
        ))}
      </MotionSpan>
    </Component>
  )
}
