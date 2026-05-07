import { API_BASE_URL } from '../apiConfig'

export async function loginAdmin(credentials) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    throw new Error('Sai tài khoản hoặc mật khẩu admin.')
  }

  return response.json()
}

export async function fetchCurrentAdminUser(token) {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Phiên đăng nhập admin không còn hiệu lực.')
  }

  return response.json()
}
