import { motion } from 'framer-motion'
import { VIEWPORT, fadeIn, revealTransition, riseIn, useMotionSafe } from '../../lib/motion'

const VARIANTS = {
  up: (safe) => fadeIn({ direction: 'up', safe }),
  down: (safe) => fadeIn({ direction: 'down', safe }),
  left: (safe) => fadeIn({ direction: 'left', safe }),
  right: (safe) => fadeIn({ direction: 'right', safe }),
  fade: (safe) => fadeIn({ direction: 'up', distance: 0, safe }),
  rise: (safe) => riseIn({ safe }),
}

/**
 * Reveals its children once they scroll into view.
 *
 * Pass `child` when the element sits inside a <Stagger>: it then inherits the
 * parent's trigger and timing instead of running its own viewport observer,
 * which is what keeps a grid animating as one sequence rather than N races.
 */
export function Reveal({
  as = 'div',
  variant = 'up',
  delay = 0,
  duration = 0.6,
  amount,
  child = false,
  className,
  children,
  ...rest
}) {
  const safe = useMotionSafe()
  const Component = motion[as] ?? motion.div
  const variants = (VARIANTS[variant] ?? VARIANTS.up)(safe)
  const transition = revealTransition({ duration, delay, safe })

  /*
   * Reduced motion renders the finished state as plain markup. Animating opacity
   * from 0 would still be an animation, and it would still leave the content
   * invisible until a frame is served — bad for anyone whose browser is starving
   * rAF (background tab, low-power mode). Static is the honest degradation.
   */
  if (!safe) {
    const Plain = as
    return (
      <Plain className={className} {...rest}>
        {children}
      </Plain>
    )
  }

  if (child) {
    return (
      <Component className={className} variants={variants} transition={transition} {...rest}>
        {children}
      </Component>
    )
  }

  return (
    <Component
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={amount ? { once: true, amount } : VIEWPORT}
      transition={transition}
      {...rest}
    >
      {children}
    </Component>
  )
}
