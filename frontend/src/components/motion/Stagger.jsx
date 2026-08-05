import { motion } from 'framer-motion'
import { VIEWPORT, stagger, useMotionSafe } from '../../lib/motion'

/**
 * Drives a sequence of <Reveal child /> descendants from one viewport trigger.
 * Nesting is supported: an inner Stagger can itself be a `child` of an outer one.
 */
export function Stagger({
  as = 'div',
  each = 0.08,
  delay = 0,
  amount,
  child = false,
  className,
  children,
  ...rest
}) {
  const safe = useMotionSafe()
  const Component = motion[as] ?? motion.div
  const variants = stagger({ each, delay, safe })

  // Reduced motion: no orchestration needed, render the plain container.
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
      <Component className={className} variants={variants} {...rest}>
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
      {...rest}
    >
      {children}
    </Component>
  )
}
