const COPY = {
  vi: 'Đang tải...',
  en: 'Loading...',
  zh: '加载中...',
}

export function PageLoading({ locale = 'en' }) {
  return (
    <div
      className="flex min-h-[60vh] flex-col items-center justify-center gap-4"
      role="status"
      aria-live="polite"
    >
      <span
        className="h-10 w-10 animate-spin rounded-full border-[3px] border-forest-100 border-t-gold-500"
        aria-hidden="true"
      />
      <p className="text-sm text-forest-950/60">{COPY[locale] ?? COPY.en}</p>
    </div>
  )
}
