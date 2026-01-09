/**
 * API Error Handling Utilities
 * Provides consistent error handling across the permission system
 */

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public data?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Parse API response and handle errors
 */
export async function parseApiResponse<T>(response: Response): Promise<T> {
  const data = await response.json()

  if (!response.ok) {
    const errorMessage =
      data.message || `API Error: ${response.status}`
    throw new ApiError(response.status, errorMessage, data)
  }

  if (!data.success && data.data === null) {
    throw new ApiError(response.status, data.message || 'Unknown error', data)
  }

  return data.data || data
}

/**
 * Format API error for display
 */
export function formatApiError(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'An unknown error occurred'
}

/**
 * Retry API call with exponential backoff
 */
export async function retryApiCall<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error | null = null

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError
}

/**
 * Build query string from parameters
 */
export function buildQueryString(params: Record<string, any>): string {
  const filtered = Object.entries(params)
    .filter(([_, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)

  return filtered.length > 0 ? '?' + filtered.join('&') : ''
}

/**
 * Check if error is network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) {
    return error.message.includes('fetch') || error.message.includes('network')
  }
  return false
}

/**
 * Check if error is authentication error
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.statusCode === 401 || error.statusCode === 403
  }
  return false
}

/**
 * Check if error is validation error
 */
export function isValidationError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.statusCode === 422 || error.statusCode === 400
  }
  return false
}

/**
 * Check if error is server error
 */
export function isServerError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.statusCode >= 500
  }
  return false
}

/**
 * Log error with context
 */
export function logError(
  context: string,
  error: unknown,
  additionalInfo?: Record<string, any>
): void {
  const timestamp = new Date().toISOString()
  const message = formatApiError(error)

  console.error(
    `[${timestamp}] ${context}: ${message}`,
    additionalInfo || {}
  )
}

/**
 * Create user-friendly error message
 */
export function getUserErrorMessage(error: unknown): string {
  if (isNetworkError(error)) {
    return 'Network error. Please check your connection.'
  }

  if (isAuthError(error)) {
    return 'Authentication failed. Please log in again.'
  }

  if (isValidationError(error)) {
    if (error instanceof ApiError && error.data?.errors) {
      return Object.values(error.data.errors).flat().join(', ')
    }
    return 'Please check your input and try again.'
  }

  if (isServerError(error)) {
    return 'Server error. Please try again later.'
  }

  return formatApiError(error) || 'An error occurred. Please try again.'
}

/**
 * Validate required fields
 */
export function validateRequired(
  data: Record<string, any>,
  fields: string[]
): string[] {
  const missing: string[] = []

  fields.forEach((field) => {
    const value = data[field]
    if (value === null || value === undefined || value === '') {
      missing.push(field)
    }
  })

  return missing
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  valid: boolean
  strength: 'weak' | 'medium' | 'strong'
  message: string
} {
  if (password.length < 6) {
    return {
      valid: false,
      strength: 'weak',
      message: 'Password must be at least 6 characters',
    }
  }

  let strength: 'weak' | 'medium' | 'strong' = 'weak'
  let score = 0

  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++

  if (score >= 3) {
    strength = 'strong'
  } else if (score >= 2) {
    strength = 'medium'
  }

  return {
    valid: true,
    strength,
    message:
      strength === 'strong'
        ? 'Strong password'
        : strength === 'medium'
          ? 'Medium strength password'
          : 'Weak password. Consider using uppercase, numbers, and symbols',
  }
}

/**
 * Create abort controller for request
 */
export function createAbortController(timeoutMs = 30000): AbortController {
  const controller = new AbortController()

  setTimeout(() => {
    controller.abort()
  }, timeoutMs)

  return controller
}

/**
 * Safe JSON parse
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json)
  } catch {
    return fallback
  }
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): T {
  let timeoutId: NodeJS.Timeout | null = null

  return ((...args: any[]) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      func(...args)
    }, delay)
  }) as T
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number
): T {
  let lastCall = 0

  return ((...args: any[]) => {
    const now = Date.now()
    if (now - lastCall >= limit) {
      lastCall = now
      func(...args)
    }
  }) as T
}
