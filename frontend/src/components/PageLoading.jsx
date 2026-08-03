const COPY = {
  vi: 'Đang tải...',
  en: 'Loading...',
  zh: '加载中...',
}

export function PageLoading({ locale = 'en' }) {
  return (
    <div className="page-loading-state" role="status" aria-live="polite">
      <span className="page-loading-spinner" aria-hidden="true" />
      <p>{COPY[locale] ?? COPY.en}</p>
    </div>
  )
}
