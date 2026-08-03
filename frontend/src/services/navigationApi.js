import { API_BASE_URL } from './apiConfig'

export async function loadNavigation(locale, signal) {
  const response = await fetch(
    `${API_BASE_URL}/api/public/navigation?lang=${encodeURIComponent(locale)}`,
    {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal,
    },
  )

  if (!response.ok) {
    throw new Error(`Navigation request failed with status ${response.status}`)
  }

  return response.json()
}
