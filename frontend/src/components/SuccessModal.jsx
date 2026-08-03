import { useEffect } from 'react'

/**
 * @param {object} props
 * @param {boolean} props.open
 * @param {string} props.title
 * @param {string} props.message
 * @param {string} [props.closeLabel]
 * @param {function} props.onClose
 */
export function SuccessModal({ open, title, message, closeLabel = 'Đóng', onClose }) {
  useEffect(() => {
    if (!open) return
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-forest-950/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-card-hover"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center text-forest-600" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
            <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="1.5" />
            <path d="M7 12.5l3.5 3.5 6.5-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 id="modal-title" className="mt-4 font-display text-xl font-semibold text-forest-950">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-forest-950/65">{message}</p>
        <button
          type="button"
          className="mt-6 inline-flex h-11 cursor-pointer items-center rounded-full bg-forest-800 px-7 text-sm font-semibold text-white transition-colors hover:bg-forest-900"
          onClick={onClose}
        >
          {closeLabel}
        </button>
      </div>
    </div>
  )
}
