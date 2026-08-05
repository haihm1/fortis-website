import { useMotionSafe } from '../../lib/motion'

/**
 * Edge-to-edge ticker. The track holds two identical copies of `items`; the CSS
 * animation translates it by exactly -50%, so the second copy lands where the
 * first started and the loop is seamless.
 *
 * Under reduced motion the animation is dropped (see .fortis-marquee in
 * tailwind.css) and the strip reads as a static, scrollable row.
 */
export function Marquee({ items, speed = 38, className = '' }) {
  const safe = useMotionSafe()
  const list = items ?? []

  if (list.length === 0) {
    return null
  }

  return (
    <div
      className={`fortis-marquee group relative flex overflow-hidden ${className}`}
      // The duplicate copy is decorative; the first copy carries the real text.
      role="presentation"
    >
      {[0, 1].map((copy) => (
        <div
          className="fortis-marquee-track flex shrink-0 items-center gap-10 pr-10"
          key={copy}
          style={{ animationDuration: `${speed}s` }}
          aria-hidden={copy === 1 ? 'true' : undefined}
        >
          {list.map((item, index) => (
            <span className="flex shrink-0 items-center gap-10" key={`${copy}-${item}-${index}`}>
              <span className="font-display text-lg font-medium whitespace-nowrap text-white/85 lg:text-xl">
                {item}
              </span>
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold-400" aria-hidden="true" />
            </span>
          ))}
        </div>
      ))}
      {safe ? null : <span className="sr-only">Danh sách thị trường xuất khẩu</span>}
    </div>
  )
}
