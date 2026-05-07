import { getFallbackHomeContent } from '../locales/homeContentFallback'
import { API_BASE_URL } from './apiConfig'

export async function loadHomeContent(locale, signal) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/public/home?lang=${encodeURIComponent(locale)}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        signal,
      },
    )

    if (!response.ok) {
      throw new Error(`Home content request failed with status ${response.status}`)
    }

    const data = await response.json()
    return { data, source: 'api' }
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error
    }

    return {
      data: getFallbackHomeContent(locale),
      source: 'fallback',
    }
  }
}
