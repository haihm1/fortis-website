import { API_BASE_URL } from './apiConfig'

export async function submitContactRequest(payload, attachmentFile) {
  const formData = new FormData()
  formData.append(
    'payload',
    new Blob([JSON.stringify(payload)], { type: 'application/json' }),
  )

  if (attachmentFile) {
    formData.append('attachment', attachmentFile)
  }

  const response = await fetch(`${API_BASE_URL}/api/public/contacts`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
    },
    body: formData,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || 'Failed to submit contact request')
  }

  return response.json()
}
