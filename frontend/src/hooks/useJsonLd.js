import { useEffect, useMemo } from 'react'

/**
 * Inject or update a JSON-LD <script> block.
 * @param {string} id   Unique id so multiple schemas can coexist per page.
 * @param {object} data Plain JS object that will be serialised as JSON-LD.
 */
export function useJsonLd(id, data) {
  const serializedData = useMemo(() => (data ? JSON.stringify(data) : ''), [data])

  useEffect(() => {
    if (!serializedData) return

    const scriptId = `jsonld-${id}`
    let el = document.getElementById(scriptId)
    if (!el) {
      el = document.createElement('script')
      el.id = scriptId
      el.type = 'application/ld+json'
      document.head.appendChild(el)
    }
    el.textContent = serializedData

    return () => {
      const existing = document.getElementById(scriptId)
      if (existing) existing.remove()
    }
  }, [id, serializedData])
}
