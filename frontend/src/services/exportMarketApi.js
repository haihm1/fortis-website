import { API_BASE_URL } from './apiConfig'

export async function loadExportMarket(locale, signal) {
  const response = await fetch(
    `${API_BASE_URL}/api/public/export-market?lang=${encodeURIComponent(locale)}`,
    { headers: { Accept: 'application/json' }, signal },
  )

  if (!response.ok) {
    throw new Error(`Export market request failed with status ${response.status}`)
  }

  return response.json()
}

export async function loadExportMarketArticle(locale, slug, signal) {
  const response = await fetch(
    `${API_BASE_URL}/api/public/export-market/${encodeURIComponent(slug)}?lang=${encodeURIComponent(locale)}`,
    { headers: { Accept: 'application/json' }, signal },
  )

  if (!response.ok) {
    throw new Error(`Export market article request failed with status ${response.status}`)
  }

  return response.json()
}
