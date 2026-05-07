import { getFallbackProductCatalog } from '../data/productCatalogFallback'
import { API_BASE_URL } from './apiConfig'

function normalizeCatalog(data) {
  const categories = data.categories ?? []
  const products = (data.products ?? []).map((product) => {
    const categoryName =
      product.categoryName ??
      categories.find((category) => category.id === product.categoryId)?.name ??
      ''

    return {
      ...product,
      categoryName,
      specificationFileUrl: product.specificationFileUrl ?? null,
      gallery:
        product.gallery && product.gallery.length > 0
          ? product.gallery
          : product.image
            ? [product.image]
            : [],
    }
  })

  return {
    ...data,
    categories,
    products,
  }
}

export async function loadProductCatalog(locale, signal) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/public/catalog?lang=${encodeURIComponent(locale)}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        signal,
      },
    )

    if (!response.ok) {
      throw new Error(`Product catalog request failed with status ${response.status}`)
    }

    const data = normalizeCatalog(await response.json())
    return { data, source: 'api' }
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error
    }

    return {
      data: normalizeCatalog(getFallbackProductCatalog(locale)),
      source: 'fallback',
    }
  }
}
