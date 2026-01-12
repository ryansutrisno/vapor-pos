/**
 * Fonnte WhatsApp Service
 * Based on: https://docs.fonnte.com/api-send-message/
 */

interface FonntePayload {
  target: string
  message: string
  countryCode?: string
}

interface FonnteResponse {
  status: boolean
  detail: string
  id: string[]
  process: string
  requestid: number
}

interface FonnteError {
  status: boolean
  reason: string
  requestid: number
}

export async function sendViaFonnte(
  token: string,
  payload: FonntePayload
): Promise<FonnteResponse | FonnteError> {
  const formData = new FormData()
  formData.append('target', payload.target)
  formData.append('message', payload.message)
  
  if (payload.countryCode) {
    formData.append('countryCode', payload.countryCode)
  } else {
    formData.append('countryCode', '62')
  }

  try {
    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': token
      },
      body: formData
    })

    const data = await response.json()
    return data as FonnteResponse | FonnteError
  } catch (error) {
    console.error('Fonnte API error:', error)
    return {
      status: false,
      reason: 'Network error',
      requestid: 0
    }
  }
}

export function formatPhoneForFonnte(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('0')) {
    return cleaned.slice(1)
  }
  if (cleaned.startsWith('62')) {
    return cleaned
  }
  return cleaned
}

export function isValidFonnteResponse(
  response: FonnteResponse | FonnteError
): response is FonnteResponse {
  return response.status === true
}

export function getFonnteErrorMessage(error: FonnteError): string {
  const errorMessages: Record<string, string> = {
    'token invalid': 'Token Fonnte tidak valid',
    'devices must belong to an account': 'Device harus milik akun yang sama',
    'input invalid': 'Input tidak valid',
    'url invalid': 'URL tidak valid',
    'url unreachable': 'URL tidak dapat diakses',
    'file format not supported': 'Format file tidak didukung',
    'file size must under 4MB': 'Ukuran file harus kurang dari 4MB',
    'target invalid': 'Nomor target tidak valid',
    'JSON format invalid': 'Format JSON tidak valid',
    'insufficient quota': 'Kuota pesan tidak cukup'
  }

  return errorMessages[error.reason] || `Error: ${error.reason}`
}
