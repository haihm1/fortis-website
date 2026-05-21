import { getFallbackHomeContent } from '../locales/homeContentFallback'
import { API_BASE_URL } from './apiConfig'

function resolveMediaUrl(url) {
  if (!url || url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url
  }
  return `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`
}

function normalizeHomeContent(data) {
  return {
    ...data,
    heroSlides: (data.heroSlides ?? []).map((slide) => ({
      ...slide,
      image: resolveMediaUrl(slide.image),
    })),
    featuredProducts: (data.featuredProducts ?? []).map((product) => ({
      ...product,
      image: resolveMediaUrl(product.image),
      specifications: Array.isArray(product.specifications)
        ? product.specifications.filter((spec) => spec?.label && spec?.value)
        : [],
      applications: Array.isArray(product.applications) ? product.applications.filter(Boolean) : [],
    })),
  }
}

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

    const data = normalizeHomeContent(await response.json())
    return { data, source: 'api' }
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error
    }

    return {
      data: normalizeHomeContent(getFallbackHomeContent(locale)),
      source: 'fallback',
    }
  }
}
