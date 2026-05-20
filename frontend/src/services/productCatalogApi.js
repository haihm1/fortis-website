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
      specifications: normalizeSpecifications(product.specifications),
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

function normalizeSpecifications(specifications) {
  if (Array.isArray(specifications)) {
    return specifications.filter((spec) => spec?.label && spec?.value)
  }

  if (specifications && typeof specifications === 'object') {
    const legacyLabels = {
      thickness: 'Packing format',
      moisture: 'Quality standard',
      glueType: 'Origin / certification',
      size: 'Net weight / carton',
    }
    return Object.entries(legacyLabels)
      .map(([key, label]) => ({ label, value: specifications[key] }))
      .filter((spec) => spec.value)
  }

  return []
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
