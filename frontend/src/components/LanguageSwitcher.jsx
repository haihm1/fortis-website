const OPTIONS = [
  { value: 'en', label: 'EN' },
  { value: 'vi', label: 'VI' },
  { value: 'zh', label: '中文' },
]

export function LanguageSwitcher({ locale, onChange }) {
  return (
    <div
      className="inline-flex items-center gap-1 rounded-full bg-forest-50 p-1 ring-1 ring-forest-950/10"
      role="group"
      aria-label="Language switcher"
    >
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`inline-flex h-9 min-w-11 cursor-pointer items-center justify-center rounded-full px-3 text-sm font-medium transition-colors duration-200 ${
            option.value === locale
              ? 'bg-forest-800 text-white'
              : 'text-forest-950/70 hover:bg-forest-100 hover:text-forest-950'
          }`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
