import { API_BASE_URL } from '../apiConfig'

async function request(path, token, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || 'Admin API request failed')
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

function resolveMediaUrl(url) {
  if (!url || url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url
  }
  return `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`
}

function normalizeAdminContent(data) {
  return {
    ...data,
    aboutArticleVi: data.aboutArticleVi ?? '',
    aboutArticleEn: data.aboutArticleEn ?? '',
    aboutArticleZh: data.aboutArticleZh ?? '',
    banners: (data.banners ?? []).map((banner) => ({
      ...banner,
      titleVi: banner.titleVi ?? '',
      titleEn: banner.titleEn ?? '',
      titleZh: banner.titleZh ?? '',
      descriptionVi: banner.descriptionVi ?? '',
      descriptionEn: banner.descriptionEn ?? '',
      descriptionZh: banner.descriptionZh ?? '',
      imageUrl: resolveMediaUrl(banner.imageUrl),
    })),
  }
}

export function getAdminContacts(token) {
  return request('/api/admin/contacts', token)
}

export function updateAdminContactStatus(token, contactId, status) {
  return request(`/api/admin/contacts/${contactId}/status`, token, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  })
}

export function getAdminCustomers(token) {
  return request('/api/admin/customers', token)
}

export function createAdminCustomer(token, payload) {
  return request('/api/admin/customers', token, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
}

export function updateAdminCustomer(token, customerId, payload) {
  return request(`/api/admin/customers/${customerId}`, token, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
}

export function deleteAdminCustomer(token, customerId) {
  return request(`/api/admin/customers/${customerId}`, token, {
    method: 'DELETE',
  })
}

export function getAdminExportOrders(token) {
  return request('/api/admin/export-orders', token)
}

export function createAdminExportOrder(token, payload) {
  return request('/api/admin/export-orders', token, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
}

export function updateAdminExportOrder(token, orderId, payload) {
  return request(`/api/admin/export-orders/${orderId}`, token, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
}

export function updateAdminExportOrderStatus(token, orderId, payload) {
  return request(`/api/admin/export-orders/${orderId}/status`, token, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
}

export function deleteAdminExportOrder(token, orderId) {
  return request(`/api/admin/export-orders/${orderId}`, token, {
    method: 'DELETE',
  })
}

export function getAdminContent(token) {
  return request('/api/admin/content', token).then(normalizeAdminContent)
}

export function getAdminNavigation(token) {
  return request('/api/admin/navigation', token)
}

export function updateAdminNavigation(token, items) {
  return request('/api/admin/navigation', token, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ items }),
  })
}

export function updateAdminContentProfile(token, payload) {
  return request('/api/admin/content/profile', token, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  }).then(normalizeAdminContent)
}

export async function updateAdminBanner(token, slot, payload, imageFile) {
  const formData = new FormData()
  formData.append(
    'payload',
    new Blob([JSON.stringify(payload)], { type: 'application/json' }),
  )

  if (imageFile) {
    formData.append('image', imageFile)
  }

  return request(`/api/admin/content/banners/${slot}`, token, {
    method: 'PUT',
    body: formData,
  }).then((banner) => ({ ...banner, imageUrl: resolveMediaUrl(banner.imageUrl) }))
}

export function getAdminAccounts(token) {
  return request('/api/admin/accounts', token)
}

export function createAdminAccount(token, payload) {
  return request('/api/admin/accounts', token, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
}

export function updateAdminAccount(token, accountId, payload) {
  return request(`/api/admin/accounts/${accountId}`, token, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
}

export function changeAdminPassword(token, accountId, payload) {
  return request(`/api/admin/accounts/${accountId}/change-password`, token, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
}

export function getAdminCatalog(token) {
  return request('/api/admin/catalog', token)
}

export function createAdminCategory(token, payload) {
  return request('/api/admin/catalog/categories', token, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
}

export function updateAdminCategory(token, categoryId, payload) {
  return request(`/api/admin/catalog/categories/${categoryId}`, token, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
}

export function deleteAdminCategory(token, categoryId) {
  return request(`/api/admin/catalog/categories/${categoryId}`, token, {
    method: 'DELETE',
  })
}

function buildProductFormData(payload, imageFile, specificationFile) {
  const formData = new FormData()
  formData.append(
    'payload',
    new Blob([JSON.stringify(payload)], { type: 'application/json' }),
  )
  if (imageFile) {
    formData.append('image', imageFile)
  }
  if (specificationFile) {
    formData.append('specificationFile', specificationFile)
  }
  return formData
}

export function createAdminProduct(token, payload, imageFile, specificationFile) {
  return request('/api/admin/catalog/products', token, {
    method: 'POST',
    body: buildProductFormData(payload, imageFile, specificationFile),
  })
}

export function updateAdminProduct(token, productId, payload, imageFile, specificationFile) {
  return request(`/api/admin/catalog/products/${productId}`, token, {
    method: 'PUT',
    body: buildProductFormData(payload, imageFile, specificationFile),
  })
}

export function deleteAdminProduct(token, productId) {
  return request(`/api/admin/catalog/products/${productId}`, token, {
    method: 'DELETE',
  })
}

export function uploadAdminCatalogImage(token, imageFile) {
  const formData = new FormData()
  formData.append('image', imageFile)
  return request('/api/admin/catalog/upload-file', token, {
    method: 'POST',
    body: formData,
  })
}

export function getAdminExportMarket(token) {
  return request('/api/admin/export-market', token)
}

export function createAdminExportMarketArticle(token, payload) {
  return request('/api/admin/export-market', token, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
}

export function updateAdminExportMarketArticle(token, articleId, payload) {
  return request(`/api/admin/export-market/${articleId}`, token, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
}

export function deleteAdminExportMarketArticle(token, articleId) {
  return request(`/api/admin/export-market/${articleId}`, token, {
    method: 'DELETE',
  })
}
