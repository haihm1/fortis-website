import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { BRAND_CHOICE_STORAGE_KEY, charcoalEntryUrl } from '../lib/brand'
import { EASE_OUT_EXPO, useMotionSafe } from '../lib/motion'
import fortisLogo from '../image/LOGO center.png'

const MotionDiv = motion.div

const COPY = {
  vi: {
    eyebrow: 'FortisVN',
    title: 'Bạn đang quan tâm mảng nào?',
    description: 'Chọn ngành hàng để chúng tôi đưa bạn tới đúng nơi. Bạn có thể chuyển qua lại bất cứ lúc nào.',
    agriTitle: 'Nông sản xuất khẩu',
    agriDescription: 'Hoa quả nhiệt đới, gia vị và nông sản Việt Nam cho thị trường quốc tế.',
    charcoalTitle: 'Than mùn cưa',
    charcoalDescription: 'Than mùn cưa ép, than trắng và than BBQ cho khách hàng công nghiệp và xuất khẩu.',
    action: 'Vào xem',
    dismiss: 'Để sau, xem trang nông sản',
    ariaLabel: 'Chọn ngành hàng',
  },
  en: {
    eyebrow: 'FortisVN',
    title: 'Which line are you here for?',
    description: 'Pick a product line and we will take you to the right place. You can switch at any time.',
    agriTitle: 'Agricultural export',
    agriDescription: 'Tropical fruits, spices and Vietnamese agricultural products for global markets.',
    charcoalTitle: 'Sawdust charcoal',
    charcoalDescription: 'Pressed sawdust charcoal, white charcoal and BBQ charcoal for industrial and export buyers.',
    action: 'Enter',
    dismiss: 'Later — show the agricultural site',
    ariaLabel: 'Choose a product line',
  },
  zh: {
    eyebrow: 'FortisVN',
    title: '您想了解哪一条产品线？',
    description: '请选择产品线，我们会带您前往对应页面。您随时可以切换。',
    agriTitle: '农产品出口',
    agriDescription: '面向国际市场的越南热带水果、香辛料及农产品。',
    charcoalTitle: '锯末炭',
    charcoalDescription: '面向工业与出口客户的机制锯末炭、白炭及烧烤炭。',
    action: '进入',
    dismiss: '稍后，先看农产品站',
    ariaLabel: '选择产品线',
  },
}

/** localStorage throws in some embedded/private contexts; never let that break the page. */
function readStoredChoice() {
  try {
    return window.localStorage.getItem(BRAND_CHOICE_STORAGE_KEY)
  } catch {
    return null
  }
}

function storeChoice(value) {
  try {
    window.localStorage.setItem(BRAND_CHOICE_STORAGE_KEY, value)
  } catch {
    // A viewer who blocks site data simply sees the chooser again next time.
  }
}

/**
 * First-visit interstitial that routes a visitor to the agricultural or the
 * charcoal site.
 *
 * Rendered on top of the real home page rather than replacing it: the page
 * underneath stays in the DOM, so crawlers and anyone arriving with JavaScript
 * disabled still get the indexed agricultural content.
 */
export function BrandChooser({ locale }) {
  const copy = COPY[locale] ?? COPY.en
  const safe = useMotionSafe()
  // Resolved during the first render rather than in an effect, so the chooser paints
  // with the page instead of flashing in a frame later. readStoredChoice() swallows
  // the ReferenceError if this ever runs somewhere without a window.
  const [isOpen, setIsOpen] = useState(() => !readStoredChoice())
  const panelRef = useRef(null)
  const previouslyFocused = useRef(null)

  const close = useCallback((choice) => {
    if (choice) {
      storeChoice(choice)
    }
    setIsOpen(false)
  }, [])

  // Lock background scrolling and keep focus inside the dialog while it is open.
  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    previouslyFocused.current = document.activeElement
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        // Escape is the "just let me read the page" exit; it must not be recorded
        // as a deliberate choice, or the visitor never sees the chooser again.
        setIsOpen(false)
        return
      }

      if (event.key !== 'Tab' || !panelRef.current) {
        return
      }

      const focusable = panelRef.current.querySelectorAll('a[href], button:not([disabled])')
      if (focusable.length === 0) {
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = overflow
      if (previouslyFocused.current instanceof HTMLElement) {
        previouslyFocused.current.focus()
      }
    }
  }, [isOpen])

  if (!isOpen) {
    return null
  }

  const charcoalHref = charcoalEntryUrl()

  return (
    <MotionDiv
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-carbon-950/92 px-4 py-10 backdrop-blur-sm"
      initial={safe ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: safe ? 0.35 : 0 }}
      role="dialog"
      aria-modal="true"
      aria-label={copy.ariaLabel}
    >
      <MotionDiv
        className="w-full max-w-4xl outline-none"
        ref={panelRef}
        tabIndex={-1}
        initial={safe ? { opacity: 0, y: 26 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: safe ? 0.5 : 0, ease: EASE_OUT_EXPO, delay: safe ? 0.08 : 0 }}
      >
        <div className="text-center">
          <img className="mx-auto h-14 w-auto" src={fortisLogo} alt="FortisVN" decoding="async" />
          <h2 className="mt-6 font-display text-2xl leading-snug font-semibold text-white sm:text-3xl">
            {copy.title}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/60">{copy.description}</p>
        </div>

        <div className="mt-9 grid gap-4 sm:grid-cols-2">
          <ChoiceCard
            href="/"
            onClick={() => close('agri')}
            title={copy.agriTitle}
            description={copy.agriDescription}
            action={copy.action}
            tone="agri"
          />
          <ChoiceCard
            href={charcoalHref}
            onClick={() => close('charcoal')}
            title={copy.charcoalTitle}
            description={copy.charcoalDescription}
            action={copy.action}
            tone="charcoal"
          />
        </div>

        <div className="mt-7 text-center">
          <button
            className="cursor-pointer text-sm text-white/45 underline-offset-4 transition-colors hover:text-white/80 hover:underline"
            type="button"
            onClick={() => close(null)}
          >
            {copy.dismiss}
          </button>
        </div>
      </MotionDiv>
    </MotionDiv>
  )
}

function ChoiceCard({ href, onClick, title, description, action, tone }) {
  const isCharcoal = tone === 'charcoal'

  return (
    <a
      className={`group flex cursor-pointer flex-col rounded-2xl p-7 text-left ring-1 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 ${
        isCharcoal
          ? 'bg-carbon-800/80 ring-white/10 hover:bg-carbon-800 hover:ring-ember-500/50'
          : 'bg-forest-900/70 ring-white/10 hover:bg-forest-900 hover:ring-gold-400/50'
      }`}
      href={href}
      onClick={onClick}
    >
      <h3 className="font-display text-xl font-semibold text-white">{title}</h3>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-white/60">{description}</p>
      <span
        className={`mt-6 inline-flex items-center gap-2 text-sm font-semibold ${
          isCharcoal ? 'text-ember-300' : 'text-gold-300'
        }`}
      >
        {action}
        <svg
          className="transition-transform duration-200 group-hover:translate-x-1"
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path d="M3 8h10m0 0L9 4m4 4l-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </a>
  )
}
