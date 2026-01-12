/**
 * Phone Number Utilities
 * Format and validate Indonesian phone numbers
 */

/**
 * Format phone number for storage (08xx → 62xx)
 * @param phone - Phone number input (can include spaces, dashes, etc.)
 * @returns Formatted phone number with 62 prefix
 */
export function formatPhoneForStorage(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.startsWith('0')) {
    return '62' + cleaned.slice(1)
  }
  
  if (cleaned.startsWith('62')) {
    return cleaned
  }
  
  if (cleaned.startsWith('+62')) {
    return cleaned.replace(/^\+62/, '62')
  }
  
  return cleaned
}

/**
 * Format phone number for display (+62 8xx-xxx-xxxx)
 * @param phone - Phone number (62xxxx format)
 * @returns Formatted phone number for display
 */
export function formatPhoneForDisplay(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.startsWith('62')) {
    if (cleaned.length <= 4) {
      return '+' + cleaned
    }
    if (cleaned.length <= 8) {
      return '+' + cleaned.slice(0, 2) + ' ' + cleaned.slice(2)
    }
    if (cleaned.length <= 12) {
      return '+' + cleaned.slice(0, 2) + ' ' + cleaned.slice(2, 5) + '-' + cleaned.slice(5)
    }
    return '+' + cleaned.slice(0, 2) + ' ' + cleaned.slice(2, 5) + '-' + cleaned.slice(5, 9) + '-' + cleaned.slice(9)
  }
  
  if (cleaned.startsWith('0')) {
    return formatPhoneForDisplay('62' + cleaned.slice(1))
  }
  
  return phone
}

/**
 * Validate phone number format
 * @param phone - Phone number to validate
 * @returns true if valid, false otherwise
 */
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '')
  
  const indonesianMobile = /^08\d{8,11}$/
  const indonesianWithCountry = /^62\d{10,13}$/
  const international = /^\+62\d{10,13}$/
  
  return indonesianMobile.test(cleaned) || 
         indonesianWithCountry.test(cleaned) || 
         international.test(cleaned)
}

/**
 * Get phone error message
 * @param phone - Phone number that failed validation
 * @returns Error message
 */
export function getPhoneError(phone: string): string | null {
  if (!phone || phone.trim() === '') {
    return 'Nomor HP wajib diisi'
  }
  
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.startsWith('0') && cleaned.length < 10) {
    return 'Nomor HP terlalu pendek'
  }
  
  if (!isValidPhone(phone)) {
    return 'Format nomor HP tidak valid'
  }
  
  return null
}

/**
 * Auto-format phone as user types (08xx → 62xx)
 * @param phone - Current phone input
 * @param cursorPosition - Current cursor position
 * @returns Object with formatted phone and cursor adjustment
 */
export function autoFormatPhone(phone: string, cursorPosition: number = phone.length): { formatted: string; newCursorPosition: number } {
  let formatted = phone
  let newCursorPosition = cursorPosition
  
  const digitsOnly = phone.replace(/\D/g, '')
  
  if (digitsOnly.startsWith('0') && digitsOnly.length > 1) {
    formatted = '62' + digitsOnly.slice(1)
    
    if (cursorPosition > 0) {
      newCursorPosition = Math.max(0, cursorPosition + 1)
    }
  }
  
  return { formatted, newCursorPosition }
}

/**
 * Format phone for Fonnte API
 * @param phone - Phone number
 * @returns Phone number without leading 62 (Fonnte expects 8xx)
 */
export function formatPhoneForFonnte(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.startsWith('0')) {
    return cleaned.slice(1)
  }
  
  if (cleaned.startsWith('62')) {
    return cleaned.slice(2)
  }
  
  return cleaned
}

/**
 * Format phone for wa.me link
 * @param phone - Phone number
 * @returns Phone number with 62 prefix
 */
export function formatPhoneForWALink(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.startsWith('0')) {
    return '62' + cleaned.slice(1)
  }
  
  if (cleaned.startsWith('62')) {
    return cleaned
  }
  
  return cleaned
}

/**
 * Mask phone number for display (show only last 4 digits)
 * @param phone - Phone number
 * @returns Masked phone number
 */
export function maskPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.length <= 4) {
    return '*'.repeat(cleaned.length)
  }
  
  return '*'.repeat(cleaned.length - 4) + cleaned.slice(-4)
}

/**
 * Extract clean phone digits from various formats
 * @param phone - Phone number in any format
 * @returns Clean digits only
 */
export function extractPhoneDigits(phone: string): string {
  return phone.replace(/\D/g, '')
}
