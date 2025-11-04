import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  classifyError,
  isAuthError,
  isNetworkError,
  getUserErrorMessage,
  logError,
  formatErrorForUser,
} from '../errorHandling'

describe('errorHandling', () => {
  describe('classifyError', () => {
    it('should classify 401 errors as auth errors', () => {
      const error = new Error('401 Unauthorized')
      const classified = classifyError(error)
      
      expect(classified.type).toBe('auth')
      expect(classified.userMessage).toContain('авторизация')
    })

    it('should classify token errors as auth errors', () => {
      const error = new Error('No refresh token')
      const classified = classifyError(error)
      
      expect(classified.type).toBe('auth')
    })

    it('should classify 403 errors as forbidden', () => {
      const error = new Error('403 Forbidden')
      const classified = classifyError(error)
      
      expect(classified.type).toBe('forbidden')
      expect(classified.userMessage).toContain('прав')
    })

    it('should classify 404 errors as not_found', () => {
      const error = new Error('404 Not Found')
      const classified = classifyError(error)
      
      expect(classified.type).toBe('not_found')
      expect(classified.userMessage).toContain('не найден')
    })

    it('should classify 400 errors as validation', () => {
      const error = new Error('400 Bad Request: Invalid email')
      const classified = classifyError(error)
      
      expect(classified.type).toBe('validation')
    })

    it('should classify 500 errors as server errors', () => {
      const error = new Error('500 Internal Server Error')
      const classified = classifyError(error)
      
      expect(classified.type).toBe('server')
      expect(classified.userMessage).toContain('сервер')
    })

    it('should classify network errors', () => {
      const error = new Error('Network request failed')
      const classified = classifyError(error)
      
      expect(classified.type).toBe('network')
      expect(classified.userMessage).toContain('подключени')
    })

    it('should classify unknown errors', () => {
      const error = new Error('Something went wrong')
      const classified = classifyError(error)
      
      expect(classified.type).toBe('unknown')
    })

    it('should handle error objects with status code', () => {
      const error = { message: 'Error', status: 401 }
      const classified = classifyError(error)
      
      expect(classified.type).toBe('auth')
      expect(classified.statusCode).toBe(401)
    })

    it('should handle string errors', () => {
      const error = 'Something broke'
      const classified = classifyError(error)
      
      expect(classified.message).toBe('Something broke')
      expect(classified.type).toBe('unknown')
    })
  })

  describe('isAuthError', () => {
    it('should return true for auth errors', () => {
      const error = new Error('401 Unauthorized')
      expect(isAuthError(error)).toBe(true)
    })

    it('should return false for non-auth errors', () => {
      const error = new Error('404 Not Found')
      expect(isAuthError(error)).toBe(false)
    })
  })

  describe('isNetworkError', () => {
    it('should return true for network errors', () => {
      const error = new Error('Network connection failed')
      expect(isNetworkError(error)).toBe(true)
    })

    it('should return false for non-network errors', () => {
      const error = new Error('Validation failed')
      expect(isNetworkError(error)).toBe(false)
    })
  })

  describe('getUserErrorMessage', () => {
    it('should return user-friendly message for auth errors', () => {
      const error = new Error('401 Unauthorized')
      const message = getUserErrorMessage(error)
      
      expect(message).toContain('авторизация')
    })

    it('should return user-friendly message for network errors', () => {
      const error = new Error('fetch failed')
      const message = getUserErrorMessage(error)
      
      expect(message).toContain('подключени')
    })

    it('should return original message for validation errors', () => {
      const error = new Error('Invalid email format')
      const message = getUserErrorMessage(error)
      
      expect(message).toBe('Invalid email format')
    })
  })

  describe('logError', () => {
    let consoleErrorSpy: any

    beforeEach(() => {
      consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
      consoleErrorSpy.mockRestore()
    })

    it('should log error in development mode', () => {
      const originalMode = import.meta.env.MODE
      import.meta.env.MODE = 'development'
      
      const error = new Error('Test error')
      logError(error, 'TestContext')
      
      expect(consoleErrorSpy).toHaveBeenCalled()
      
      import.meta.env.MODE = originalMode
    })

    it('should not log in production mode', () => {
      const originalMode = import.meta.env.MODE
      import.meta.env.MODE = 'production'
      
      const error = new Error('Test error')
      logError(error)
      
      expect(consoleErrorSpy).not.toHaveBeenCalled()
      
      import.meta.env.MODE = originalMode
    })
  })

  describe('formatErrorForUser', () => {
    it('should format not_found error with context', () => {
      const error = new Error('404 Not Found')
      const formatted = formatErrorForUser(error, 'Список')
      
      expect(formatted).toContain('Список не найден')
    })

    it('should format validation error without modification', () => {
      const error = new Error('400 Invalid email')
      const formatted = formatErrorForUser(error, 'Email')
      
      expect(formatted).toContain('Invalid email')
    })

    it('should format network error', () => {
      const error = new Error('Network failed')
      const formatted = formatErrorForUser(error)
      
      expect(formatted).toContain('подключени')
    })

    it('should handle errors without context', () => {
      const error = new Error('Some error')
      const formatted = formatErrorForUser(error)
      
      expect(formatted).toBe('Some error')
    })
  })
})

