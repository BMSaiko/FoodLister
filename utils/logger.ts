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

// List of keys that should be sanitized or removed from logs
const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'secret',
  'key',
  'api_key',
  'apikey',
  'auth',
  'authorization',
  'bearer',
  'cookie',
  'session',
  'ssn',
  'social_security',
  'credit_card',
  'card_number',
  'cvv',
  'pin',
  'email', // Consider email as sensitive
  'phone',
  'address',
  'location', // Location data might be sensitive
  'ip',
  'user_agent'
]);

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
 * Sanitizes URLs to remove sensitive query parameters while preserving the base URL
 */
function sanitizeUrlForLogging(urlString: string): string {
  if (!urlString || typeof urlString !== 'string') {
    return urlString;
  }

  try {
    const url = new URL(urlString);
    // Remove sensitive query parameters
    const sensitiveParams = new Set(['token', 'key', 'api_key', 'apikey', 'auth', 'authorization', 'bearer', 'session', 'password', 'secret', 'access_token', 'refresh_token', 'id_token', 'code', 'state']);

    for (const param of sensitiveParams) {
      if (url.searchParams.has(param)) {
        url.searchParams.set(param, '[REDACTED]');
      }
    }

    return url.toString();
  } catch (error) {
    // If URL parsing fails, return a truncated version
    return urlString.length > 100 ? urlString.substring(0, 100) + '...' : urlString;
  }
}

/**
 * Recursively sanitizes an object to remove or mask sensitive information
 */
function sanitizeObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    // Check if this looks like a URL and sanitize accordingly
    if (obj.startsWith('http://') || obj.startsWith('https://') || obj.startsWith('//')) {
      return sanitizeUrlForLogging(obj);
    }

    // Mask potential sensitive strings
    if (obj.length > 10) {
      return '[REDACTED]';
    }
    return obj;
  }

  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (typeof obj === 'object') {
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();
      if (SENSITIVE_KEYS.has(lowerKey) || lowerKey.includes('password') || lowerKey.includes('secret')) {
        sanitized[key] = '[REDACTED]';
      } else if (lowerKey.includes('url') || lowerKey.includes('href') || lowerKey.includes('original')) {
        // Special handling for URL-related fields
        sanitized[key] = sanitizeUrlForLogging(String(value));
      } else {
        sanitized[key] = sanitizeObject(value);
      }
    }

    return sanitized;
  }

  // For other types (functions, symbols, etc.), don't log them
  return '[UNSUPPORTED_TYPE]';
}

/**
 * Logs a message with the specified level and optional context
 */
function log(level: LogLevel, message: string, context?: Record<string, any>): void {
  const sanitizedContext = context ? sanitizeObject(context) : undefined;

  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    context: sanitizedContext
  };

  // Structured JSON logging for security and parseability
  const logMethod = level === LogLevel.ERROR ? console.error :
                   level === LogLevel.WARN ? console.warn :
                   level === LogLevel.INFO ? console.info : console.debug;

  logMethod(JSON.stringify(entry));
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
