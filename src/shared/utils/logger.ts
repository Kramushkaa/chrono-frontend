/**
 * Структурированное логирование для frontend (аналог backend logger)
 */

interface LogContext {
  userId?: string | number;
  page?: string;
  action?: string;
  component?: string;
  error?: Error | unknown;
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  context?: LogContext;
}

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isProduction = import.meta.env.PROD;
  private isDevelopment = import.meta.env.DEV;
  
  // Минимальный уровень логирования для production
  private minProductionLevel: LogLevel = 'warn';

  private formatLog(level: LogLevel, message: string, context?: LogContext): string {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(context && { context }),
    };

    if (this.isProduction) {
      // В production используем JSON формат для возможного remote logging
      return JSON.stringify(logEntry);
    } else {
      // В development используем удобочитаемый формат с цветами
      const colors = {
        debug: '\x1b[36m', // Cyan
        info: '\x1b[34m',  // Blue
        warn: '\x1b[33m',  // Yellow
        error: '\x1b[31m', // Red
        reset: '\x1b[0m',
      };
      
      const color = colors[level] || '';
      const contextStr = context ? ` ${JSON.stringify(context, null, 2)}` : '';
      return `${color}[${logEntry.timestamp}] ${level.toUpperCase()}:${colors.reset} ${message}${contextStr}`;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.isDevelopment) {
      return true; // В dev логируем всё
    }

    // В production проверяем минимальный уровень
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(level);
    const minLevelIndex = levels.indexOf(this.minProductionLevel);
    
    return currentLevelIndex >= minLevelIndex;
  }

  private writeLog(level: LogLevel, message: string, context?: LogContext): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const formattedLog = this.formatLog(level, message, context);

    switch (level) {
      case 'error':
        console.error(formattedLog);
        break;
      case 'warn':
        console.warn(formattedLog);
        break;
      case 'debug':
        console.debug(formattedLog);
        break;
      default:
        console.log(formattedLog);
    }
  }

  debug(message: string, context?: LogContext): void {
    this.writeLog('debug', message, context);
  }

  info(message: string, context?: LogContext): void {
    this.writeLog('info', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.writeLog('warn', message, context);
  }

  error(message: string, context?: LogContext): void {
    this.writeLog('error', message, context);
  }

  // Специальные методы для типичных сценариев

  /**
   * Логирование ошибок API
   */
  apiError(endpoint: string, error: unknown, context?: LogContext): void {
    this.error(`API error: ${endpoint}`, {
      endpoint,
      error,
      action: 'api_call',
      ...context,
    });
  }

  /**
   * Логирование событий пользователя
   */
  userAction(action: string, context?: LogContext): void {
    this.info(`User action: ${action}`, {
      action,
      ...context,
    });
  }

  /**
   * Логирование ошибок компонентов
   */
  componentError(component: string, error: unknown, context?: LogContext): void {
    this.error(`Component error: ${component}`, {
      component,
      error,
      ...context,
    });
  }

  /**
   * Логирование предупреждений о производительности
   */
  performanceWarning(operation: string, duration: number, context?: LogContext): void {
    if (duration > 1000) {
      this.warn(`Slow operation: ${operation} (${duration}ms)`, {
        operation,
        duration,
        action: 'performance',
        ...context,
      });
    }
  }

  /**
   * Установка минимального уровня логирования для production
   */
  setMinProductionLevel(level: LogLevel): void {
    this.minProductionLevel = level;
  }
}

// Создаем глобальный экземпляр logger
export const logger = new Logger();

// Экспортируем класс для тестирования
export { Logger };
export type { LogContext, LogEntry, LogLevel };

