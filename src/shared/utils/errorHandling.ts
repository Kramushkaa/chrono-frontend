/**
 * Утилиты для обработки и классификации ошибок
 */

export type ErrorType = 
  | 'auth'           // Ошибки авторизации (401, токены)
  | 'forbidden'      // Доступ запрещен (403)
  | 'not_found'      // Ресурс не найден (404)
  | 'validation'     // Ошибки валидации (400)
  | 'network'        // Сетевые ошибки
  | 'server'         // Ошибки сервера (500)
  | 'unknown'        // Неизвестные ошибки

export interface ClassifiedError {
  type: ErrorType
  message: string
  userMessage: string
  statusCode?: number
  originalError: unknown
}

/**
 * Определяет тип ошибки на основе её содержимого
 */
export function classifyError(error: unknown): ClassifiedError {
  const errorMessage = error instanceof Error ? error.message : String(error)
  const lowerMessage = errorMessage.toLowerCase()
  
  // Извлекаем статус-код, если он есть
  const statusCode = (error as any)?.status || (error as any)?.statusCode
  
  // Проверяем на ошибки авторизации
  if (
    statusCode === 401 ||
    lowerMessage.includes('401') ||
    lowerMessage.includes('unauthorized') ||
    lowerMessage.includes('refresh') && lowerMessage.includes('token') ||
    lowerMessage.includes('authentication') ||
    lowerMessage.includes('not authenticated')
  ) {
    return {
      type: 'auth',
      message: errorMessage,
      userMessage: 'Необходима авторизация. Пожалуйста, войдите в систему.',
      statusCode,
      originalError: error,
    }
  }
  
  // Проверяем на ошибки доступа
  if (statusCode === 403 || lowerMessage.includes('403') || lowerMessage.includes('forbidden')) {
    return {
      type: 'forbidden',
      message: errorMessage,
      userMessage: 'У вас нет прав для выполнения этого действия.',
      statusCode,
      originalError: error,
    }
  }
  
  // Проверяем на ошибки "не найдено"
  if (
    statusCode === 404 ||
    lowerMessage.includes('404') ||
    lowerMessage.includes('not found') ||
    lowerMessage.includes('не найден')
  ) {
    return {
      type: 'not_found',
      message: errorMessage,
      userMessage: 'Запрашиваемый ресурс не найден.',
      statusCode,
      originalError: error,
    }
  }
  
  // Проверяем на ошибки валидации
  if (
    statusCode === 400 ||
    lowerMessage.includes('400') ||
    lowerMessage.includes('validation') ||
    lowerMessage.includes('invalid') ||
    lowerMessage.includes('валидация')
  ) {
    return {
      type: 'validation',
      message: errorMessage,
      userMessage: errorMessage, // Для валидации показываем оригинальное сообщение
      statusCode,
      originalError: error,
    }
  }
  
  // Проверяем на серверные ошибки
  if (
    (statusCode && statusCode >= 500) ||
    lowerMessage.includes('500') ||
    lowerMessage.includes('502') ||
    lowerMessage.includes('503') ||
    lowerMessage.includes('server error') ||
    lowerMessage.includes('internal error')
  ) {
    return {
      type: 'server',
      message: errorMessage,
      userMessage: 'Ошибка на сервере. Попробуйте позже.',
      statusCode,
      originalError: error,
    }
  }
  
  // Проверяем на сетевые ошибки
  if (
    lowerMessage.includes('network') ||
    lowerMessage.includes('fetch') && lowerMessage.includes('failed') ||
    lowerMessage.includes('connection') ||
    lowerMessage.includes('timeout') ||
    lowerMessage.includes('offline') ||
    lowerMessage.includes('сеть')
  ) {
    return {
      type: 'network',
      message: errorMessage,
      userMessage: 'Проблема с подключением к серверу. Проверьте интернет-соединение.',
      statusCode,
      originalError: error,
    }
  }
  
  // Неизвестная ошибка
  return {
    type: 'unknown',
    message: errorMessage,
    userMessage: errorMessage || 'Произошла неизвестная ошибка',
    statusCode,
    originalError: error,
  }
}

/**
 * Проверяет, является ли ошибка связанной с авторизацией
 */
export function isAuthError(error: unknown): boolean {
  const classified = classifyError(error)
  return classified.type === 'auth'
}

/**
 * Проверяет, является ли ошибка сетевой
 */
export function isNetworkError(error: unknown): boolean {
  const classified = classifyError(error)
  return classified.type === 'network'
}

/**
 * Получает user-friendly сообщение об ошибке
 */
export function getUserErrorMessage(error: unknown): string {
  const classified = classifyError(error)
  return classified.userMessage
}

/**
 * Логирует ошибку в консоль в development mode
 */
export function logError(error: unknown, context?: string): void {
  if (import.meta.env.MODE !== 'production') {
    const classified = classifyError(error)
    console.error(
      `[Error${context ? ` in ${context}` : ''}]`,
      `Type: ${classified.type}`,
      `Status: ${classified.statusCode || 'N/A'}`,
      `Message: ${classified.message}`,
      classified.originalError
    )
  }
}

/**
 * Форматирует ошибку для отображения пользователю с учётом контекста
 */
export function formatErrorForUser(error: unknown, context?: string): string {
  const classified = classifyError(error)
  
  if (context) {
    // Добавляем контекст к некоторым типам ошибок
    switch (classified.type) {
      case 'not_found':
        return `${context} не найден`
      case 'validation':
        return classified.userMessage
      case 'network':
        return 'Проблема с подключением. Проверьте интернет-соединение.'
      default:
        return `Ошибка: ${classified.userMessage}`
    }
  }
  
  return classified.userMessage
}


