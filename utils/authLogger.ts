/**
 * Authentication logging utility for debugging authentication issues
 */

export interface AuthEvent {
  type: 'session_start' | 'session_refresh' | 'session_expired' | 'token_error' | 'auth_error';
  timestamp: number;
  details?: any;
  userId?: string;
}

class AuthLogger {
  private events: AuthEvent[] = [];
  private isEnabled: boolean;

  constructor() {
    // Enable logging in development mode
    this.isEnabled = process.env.NODE_ENV === 'development';
  }

  log(event: AuthEvent) {
    if (!this.isEnabled) return;

    this.events.push(event);
    
    // Keep only last 100 events to prevent memory issues
    if (this.events.length > 100) {
      this.events = this.events.slice(-50);
    }

    // Log to console with formatting
    const timestamp = new Date(event.timestamp).toISOString();
    const message = `[Auth ${event.type.toUpperCase()}] ${timestamp}`;
    
    switch (event.type) {
      case 'session_start':
        console.log(`🟢 ${message}`, event.details);
        break;
      case 'session_refresh':
        console.log(`🔄 ${message}`, event.details);
        break;
      case 'session_expired':
        console.warn(`🔴 ${message}`, event.details);
        break;
      case 'token_error':
        console.error(`❌ ${message}`, event.details);
        break;
      case 'auth_error':
        console.error(`💥 ${message}`, event.details);
        break;
    }
  }

  getSessionHistory(): AuthEvent[] {
    return [...this.events];
  }

  clearHistory() {
    this.events = [];
  }

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }
}

// Create singleton instance
export const authLogger = new AuthLogger();

// Convenience functions
export const logSessionStart = (details?: any, userId?: string) => {
  authLogger.log({
    type: 'session_start',
    timestamp: Date.now(),
    details,
    userId
  });
};

export const logSessionRefresh = (details?: any, userId?: string) => {
  authLogger.log({
    type: 'session_refresh',
    timestamp: Date.now(),
    details,
    userId
  });
};

export const logSessionExpired = (details?: any, userId?: string) => {
  authLogger.log({
    type: 'session_expired',
    timestamp: Date.now(),
    details,
    userId
  });
};

export const logTokenError = (details?: any, userId?: string) => {
  authLogger.log({
    type: 'token_error',
    timestamp: Date.now(),
    details,
    userId
  });
};

export const logAuthError = (details?: any, userId?: string) => {
  authLogger.log({
    type: 'auth_error',
    timestamp: Date.now(),
    details,
    userId
  });
};

// Enhanced logging functions for debugging storage issues
export const logStorageOperation = (operation: 'get' | 'set' | 'remove', key: string, value?: any, success: boolean = true) => {
  authLogger.log({
    type: 'auth_error',
    timestamp: Date.now(),
    details: {
      operation,
      key,
      value: operation === 'get' ? value : undefined,
      success,
      timestamp: new Date().toISOString()
    }
  });
};

export const logSessionStorageCheck = (hasCookie: boolean, hasLocalStorage: boolean, cookieValue?: any, localStorageValue?: any) => {
  authLogger.log({
    type: 'session_expired',
    timestamp: Date.now(),
    details: {
      storageCheck: true,
      hasCookie,
      hasLocalStorage,
      cookieValue: hasCookie ? 'present' : 'missing',
      localStorageValue: hasLocalStorage ? 'present' : 'missing',
      timestamp: new Date().toISOString()
    }
  });
};

// Export for debugging in browser console
if (typeof window !== 'undefined') {
  (window as any).__authLogger = authLogger;
}