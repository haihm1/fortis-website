const OPTIONS = [
  { value: 'en', label: 'EN' },
  { value: 'vi', label: 'VI' },
  { value: 'zh', label: '中文' },
]

export function LanguageSwitcher({ locale, onChange }) {
  return (
    <div className="language-switcher" role="group" aria-label="Language switcher">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          className={option.value === locale ? 'is-active' : ''}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
