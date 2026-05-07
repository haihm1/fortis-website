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

export function getAdminContent(token) {
  return request('/api/admin/content', token)
}

export function updateAdminContentProfile(token, payload) {
  return request('/api/admin/content/profile', token, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
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
  })
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
