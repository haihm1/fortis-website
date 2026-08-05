/*
 * Shared motion vocabulary for the public site.
 *
 * Everything here is built so a single `prefers-reduced-motion: reduce` check can
 * neutralise it: components call `useMotionSafe()` and pass the result into the
 * variant factories, which then return zero-distance, zero-duration variants
 * instead of branching on the flag at every call site.
 */
import { useReducedMotion } from 'framer-motion'

/** Decelerating curve used for anything entering the viewport. */
export const EASE_OUT_SOFT = [0.22, 1, 0.36, 1]
/** Longer tail, used for large elements (hero copy, full-width panels). */
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1]

/**
 * Reveal triggers once and needs only a sliver of the element on screen, so tall
 * cards near the fold still animate instead of sitting visibly stuck at opacity 0.
 */
export const VIEWPORT = { once: true, amount: 0.15 }
export const VIEWPORT_EARLY = { once: true, amount: 0.05 }

/**
 * True when the user has NOT asked for reduced motion. Pass it to the factories
 * below; when false they collapse to an instant opacity swap.
 */
export function useMotionSafe() {
  return !useReducedMotion()
}

/** Directional slide + fade. `distance` is in px and flips sign for 'down'/'right'. */
export function fadeIn({ direction = 'up', distance = 32, safe = true } = {}) {
  if (!safe) {
    return { hidden: { opacity: 0 }, visible: { opacity: 1 } }
  }

  const axis = direction === 'left' || direction === 'right' ? 'x' : 'y'
  const sign = direction === 'down' || direction === 'right' ? -1 : 1

  return {
    hidden: { opacity: 0, [axis]: distance * sign },
    visible: { opacity: 1, [axis]: 0 },
  }
}

/** Subtle rise + scale for cards, so grids read as a deck rather than a list. */
export function riseIn({ safe = true } = {}) {
  if (!safe) {
    return { hidden: { opacity: 0 }, visible: { opacity: 1 } }
  }

  return {
    hidden: { opacity: 0, y: 40, scale: 0.97 },
    visible: { opacity: 1, y: 0, scale: 1 },
  }
}

/**
 * Wipes an image in from the bottom. Uses inset() rather than transform so the
 * picture itself never moves — only the window onto it grows.
 */
export function clipReveal({ safe = true } = {}) {
  if (!safe) {
    return { hidden: { opacity: 0 }, visible: { opacity: 1 } }
  }

  return {
    hidden: { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.08 },
    visible: { clipPath: 'inset(0% 0% 0% 0%)', scale: 1 },
  }
}

/**
 * Parent variant that walks its children in sequence. Children must declare the
 * matching `hidden`/`visible` keys; they inherit the trigger from this parent.
 */
export function stagger({ each = 0.08, delay = 0, safe = true } = {}) {
  return {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: safe ? each : 0,
        delayChildren: safe ? delay : 0,
      },
    },
  }
}

/** Standard transition for reveals; collapses to instant under reduced motion. */
export function revealTransition({ duration = 0.6, delay = 0, safe = true } = {}) {
  return safe
    ? { duration, delay, ease: EASE_OUT_SOFT }
    : { duration: 0, delay: 0 }
}
