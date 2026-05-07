const STORAGE_KEY = 'fortis-admin-auth'

export function loadStoredAdminAuth() {
  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY)
    return rawValue ? JSON.parse(rawValue) : null
  } catch {
    return null
  }
}

export function saveStoredAdminAuth(authState) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(authState))
}

export function clearStoredAdminAuth() {
  window.localStorage.removeItem(STORAGE_KEY)
}
