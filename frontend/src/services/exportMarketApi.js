import {
  getFallbackExportMarket,
  getFallbackExportMarketDetail,
} from '../data/exportMarketFallback'
import { API_BASE_URL } from './apiConfig'

export async function loadExportMarket(locale, signal) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/public/export-market?lang=${encodeURIComponent(locale)}`,
      { headers: { Accept: 'application/json' }, signal },
    )

    if (!response.ok) {
      throw new Error(`Export market request failed with status ${response.status}`)
    }

    return { data: await response.json(), source: 'api' }
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error
    }

    return { data: getFallbackExportMarket(locale), source: 'fallback' }
  }
}

export async function loadExportMarketArticle(locale, slug, signal) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/public/export-market/${encodeURIComponent(slug)}?lang=${encodeURIComponent(locale)}`,
      { headers: { Accept: 'application/json' }, signal },
    )

    if (!response.ok) {
      throw new Error(`Export market article request failed with status ${response.status}`)
    }

    return { data: await response.json(), source: 'api' }
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error
    }

    return { data: getFallbackExportMarketDetail(locale, slug), source: 'fallback' }
  }
}
