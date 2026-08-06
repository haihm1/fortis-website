import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Sticky header height (h-20 lg:h-24) plus a little breathing room. */
const HEADER_OFFSET = 104
const RETRY_INTERVAL_MS = 50
const MAX_WAIT_MS = 3000

/**
 * Scrolls to the element named by `location.hash`.
 *
 * React Router does not scroll to fragments on its own, so a nav item pointing at
 * `/#categories` only rewrote the URL and appeared to do nothing when the user was
 * already on that page. This closes that gap and offsets the target so it does not
 * end up hidden behind the sticky header.
 *
 * The first attempt is synchronous and retries run on a timer rather than
 * requestAnimationFrame: arriving from another route means waiting for the home
 * page to fetch its data before the anchor exists, and rAF is starved in
 * backgrounded or low-power tabs, which would strand the scroll entirely.
 */
export function useHashScroll() {
  // `key` changes on every navigation, including a repeat click on the link for the
  // location you are already at. Without it, scrolling away and clicking the same
  // nav item again would do nothing — the exact dead-click this hook exists to fix.
  const { pathname, hash, key } = useLocation()

  useEffect(() => {
    if (!hash) {
      return undefined
    }

    let timer = 0
    let waited = 0

    function scrollToTarget() {
      let target = null
      try {
        target = document.querySelector(hash)
      } catch {
        // A hash that is not a valid selector (e.g. "#a b") must not throw here.
        return true
      }

      if (!target) {
        return false
      }

      const top = target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET
      window.scrollTo({
        top: Math.max(top, 0),
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      })
      return true
    }

    if (!scrollToTarget()) {
      const retry = () => {
        waited += RETRY_INTERVAL_MS
        if (scrollToTarget() || waited >= MAX_WAIT_MS) {
          return
        }
        timer = window.setTimeout(retry, RETRY_INTERVAL_MS)
      }
      timer = window.setTimeout(retry, RETRY_INTERVAL_MS)
    }

    return () => window.clearTimeout(timer)
    // pathname so navigating /products -> /#categories re-runs this; key so a repeat
    // click on the same nav item scrolls back to the section again.
  }, [pathname, hash, key])
}
