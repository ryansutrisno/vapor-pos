// Password utility functions for staff management

/**
 * Generate a secure random password
 * @param length Password length (default: 12)
 * @param includeSymbols Whether to include symbols (default: true)
 * @returns Generated password string
 */
export function generatePassword(length: number = 12, includeSymbols: boolean = true): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'
  
  let charset = lowercase + uppercase + numbers
  if (includeSymbols) {
    charset += symbols
  }
  
  let password = ''
  
  // Ensure at least one character from each required set
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  
  if (includeSymbols) {
    password += symbols[Math.floor(Math.random() * symbols.length)]
  }
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)]
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

/**
 * Validate password strength
 * @param password Password to validate
 * @returns Object with validation result and feedback
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean
  score: number
  feedback: string[]
} {
  const feedback: string[] = []
  let score = 0
  
  // Length check
  if (password.length >= 8) {
    score += 1
  } else {
    feedback.push('Password harus minimal 8 karakter')
  }
  
  if (password.length >= 12) {
    score += 1
  }
  
  // Character variety checks
  if (/[a-z]/.test(password)) {
    score += 1
  } else {
    feedback.push('Password harus mengandung huruf kecil')
  }
  
  if (/[A-Z]/.test(password)) {
    score += 1
  } else {
    feedback.push('Password harus mengandung huruf besar')
  }
  
  if (/[0-9]/.test(password)) {
    score += 1
  } else {
    feedback.push('Password harus mengandung angka')
  }
  
  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 1
  } else {
    feedback.push('Password harus mengandung simbol khusus')
  }
  
  // Common patterns check
  const commonPatterns = [
    /123456/,
    /password/i,
    /qwerty/i,
    /admin/i,
    /letmein/i
  ]
  
  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      feedback.push('Password tidak boleh mengandung pola umum')
      score -= 1
      break
    }
  }
  
  return {
    isValid: score >= 4 && feedback.length === 0,
    score: Math.max(0, Math.min(6, score)),
    feedback
  }
}

/**
 * Get password strength label
 * @param score Password strength score (0-6)
 * @returns Strength label
 */
export function getPasswordStrengthLabel(score: number): {
  label: string
  color: string
} {
  if (score <= 2) {
    return { label: 'Lemah', color: 'text-red-600' }
  } else if (score <= 4) {
    return { label: 'Sedang', color: 'text-yellow-600' }
  } else {
    return { label: 'Kuat', color: 'text-green-600' }
  }
}

/**
 * Copy text to clipboard
 * @param text Text to copy
 * @returns Promise that resolves when copy is successful
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      const result = document.execCommand('copy')
      textArea.remove()
      return result
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    return false
  }
}

/**
 * Generate invitation token
 * @returns Random invitation token
 */
export function generateInvitationToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 32; i++) {
    token += chars[Math.floor(Math.random() * chars.length)]
  }
  return token
}

/**
 * Check if invitation is expired
 * @param invitedAt Invitation date string
 * @param expiryDays Number of days until expiry (default: 7)
 * @returns Whether invitation is expired
 */
export function isInvitationExpired(invitedAt: string, expiryDays: number = 7): boolean {
  const inviteDate = new Date(invitedAt)
  const expiryDate = new Date(inviteDate.getTime() + (expiryDays * 24 * 60 * 60 * 1000))
  return new Date() > expiryDate
}

/**
 * Get invitation expiry date
 * @param invitedAt Invitation date string
 * @param expiryDays Number of days until expiry (default: 7)
 * @returns Expiry date
 */
export function getInvitationExpiryDate(invitedAt: string, expiryDays: number = 7): Date {
  const inviteDate = new Date(invitedAt)
  return new Date(inviteDate.getTime() + (expiryDays * 24 * 60 * 60 * 1000))
}