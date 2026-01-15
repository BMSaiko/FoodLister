/**
 * Secure logging utility that prevents exposure of sensitive information
 * in logs while providing structured logging for debugging and auditing.
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
}

/**
 * Sanitizes error objects to prevent logging of sensitive information
 * Only includes safe properties like message and name
 */
function sanitizeError(error: unknown): string {
  if (!error) return 'Unknown error';

  if (error instanceof Error) {
    // Only log the error message and name, not stack trace or other properties
    return `${error.name}: ${error.message}`;
  }

  if (typeof error === 'string') {
    return error;
  }

  // For other types, convert to string but avoid logging objects that might contain sensitive data
  try {
    return String(error);
  } catch {
    return 'Error converting to string';
  }
}

/**
 * Logs a message with the specified level and optional context
 */
function log(level: LogLevel, message: string, context?: Record<string, any>): void {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    context
  };

  // In development, use console for immediate visibility
  // In production, this could be sent to a logging service
  const logMethod = level === LogLevel.ERROR ? console.error :
                   level === LogLevel.WARN ? console.warn :
                   level === LogLevel.INFO ? console.info : console.debug;

  if (context) {
    logMethod(`[${level.toUpperCase()}] ${message}`, context);
  } else {
    logMethod(`[${level.toUpperCase()}] ${message}`);
  }
}

/**
 * Logs an error message with sanitized error details
 */
export function logError(message: string, error?: unknown, context?: Record<string, any>): void {
  const sanitizedError = error ? ` - ${sanitizeError(error)}` : '';
  log(LogLevel.ERROR, `${message}${sanitizedError}`, context);
}

/**
 * Logs a warning message
 */
export function logWarn(message: string, context?: Record<string, any>): void {
  log(LogLevel.WARN, message, context);
}

/**
 * Logs an info message
 */
export function logInfo(message: string, context?: Record<string, any>): void {
  log(LogLevel.INFO, message, context);
}

/**
 * Logs a debug message
 */
export function logDebug(message: string, context?: Record<string, any>): void {
  log(LogLevel.DEBUG, message, context);
}
