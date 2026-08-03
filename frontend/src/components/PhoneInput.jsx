import { useMemo } from 'react'
import { all } from 'country-codes-list'

// Vietnam first, then sort alphabetically by English name.
// Skip entries without a calling code or with duplicated codes that create confusion.
const PRIORITY_CODES = ['VN', 'CN', 'US', 'JP', 'KR', 'SG', 'MY', 'TH', 'ID', 'PH', 'AU', 'GB', 'DE', 'FR', 'AE', 'SA']

function buildCountryOptions() {
  const countries = all().filter((c) => c.countryCallingCode && c.flag)

  const priorityMap = new Map(
    PRIORITY_CODES.map((code, idx) => [code, idx]),
  )

  return [...countries].sort((a, b) => {
    const ai = priorityMap.has(a.countryCode) ? priorityMap.get(a.countryCode) : 9999
    const bi = priorityMap.has(b.countryCode) ? priorityMap.get(b.countryCode) : 9999
    if (ai !== bi) return ai - bi
    return a.countryNameEn.localeCompare(b.countryNameEn)
  })
}

/**
 * Phone input with full country calling-code selector powered by country-codes-list.
 *
 * @param {object} props
 * @param {string} props.dialCode        e.g. "+84"
 * @param {string} props.localNumber     digits / spaces / hyphens
 * @param {function} props.onDialCodeChange
 * @param {function} props.onLocalNumberChange
 * @param {string}  [props.placeholder]
 * @param {string}  [props.ariaLabel]
 * @param {boolean} [props.required]
 */
export function PhoneInput({
  dialCode,
  localNumber,
  onDialCodeChange,
  onLocalNumberChange,
  placeholder = '365 510 567',
  ariaLabel = 'Số điện thoại',
  required = false,
}) {
  const countryOptions = useMemo(() => buildCountryOptions(), [])

  return (
    <div className="flex gap-2">
      <select
        className="h-12 w-[7.5rem] shrink-0 cursor-pointer rounded-xl border border-forest-950/15 bg-white px-2.5 text-sm text-forest-950 transition-colors focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30 focus:outline-none"
        value={dialCode}
        aria-label="Mã vùng quốc gia"
        onChange={(e) => onDialCodeChange(e.target.value)}
      >
        {countryOptions.map((country) => {
          const code = `+${country.countryCallingCode}`
          return (
            <option key={country.countryCode} value={code}>
              {country.flag} {code} {country.countryNameEn}
            </option>
          )
        })}
      </select>
      <input
        className="h-12 min-w-0 flex-1 rounded-xl border border-forest-950/15 bg-white px-4 text-sm text-forest-950 transition-colors placeholder:text-forest-950/35 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/30 focus:outline-none"
        type="tel"
        required={required}
        value={localNumber}
        placeholder={placeholder}
        aria-label={ariaLabel}
        pattern="[0-9\s-]+"
        title="Chỉ nhập số, dấu cách hoặc dấu gạch ngang"
        onChange={(e) => onLocalNumberChange(e.target.value.replace(/[^0-9\s-]/g, ''))}
      />
    </div>
  )
}
