/**
 * Authentication Utilities
 * Combines auth logging, redirect utilities, and storage helpers
 */

// ==================== Auth Logging ====================

export interface AuthEvent {
  type: 'session_start' | 'session_refresh' | 'session_expired' | 'token_error' | 'auth_error' | 'storage_operation';
  timestamp: number;
  details?: any;
  userId?: string;
}

class AuthLogger {
  private events: AuthEvent[] = [];
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = process.env.NODE_ENV === 'development';
  }

  log(event: AuthEvent) {
    if (!this.isEnabled) return;

    this.events.push(event);
    
    if (this.events.length > 100) {
      this.events = this.events.slice(-50);
    }

    const timestamp = new Date(event.timestamp).toISOString();
    console.log(`[Auth ${event.type.toUpperCase()}] ${timestamp}`, event.details);
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

export const authLogger = new AuthLogger();

// Convenience logging functions
export const logSessionStart = (details?: any, userId?: string) =>
  authLogger.log({ type: 'session_start', timestamp: Date.now(), details, userId });

export const logSessionRefresh = (details?: any, userId?: string) =>
  authLogger.log({ type: 'session_refresh', timestamp: Date.now(), details, userId });

export const logSessionExpired = (details?: any, userId?: string) =>
  authLogger.log({ type: 'session_expired', timestamp: Date.now(), details, userId });

export const logTokenError = (details?: any, userId?: string) =>
  authLogger.log({ type: 'token_error', timestamp: Date.now(), details, userId });

export const logAuthError = (details?: any, userId?: string) =>
  authLogger.log({ type: 'auth_error', timestamp: Date.now(), details, userId });

export const logStorageOperation = (operation: 'get' | 'set' | 'remove', key: string, value?: any, success: boolean = true) =>
  authLogger.log({
    type: 'storage_operation',
    timestamp: Date.now(),
    details: { operation, key, value: operation === 'get' ? value : undefined, success }
  });

// ==================== Redirect Utilities ====================

/**
 * Creates a login URL with returnTo parameter
 */
export function createLoginUrl(returnUrl: string | null = null): string {
  if (!returnUrl) {
    return '/auth/signin';
  }
  const encodedReturnUrl = encodeURIComponent(returnUrl);
  return `/auth/signin?returnTo=${encodedReturnUrl}`;
}

/**
 * Creates a signup URL with returnTo parameter
 */
export function createSignupUrl(returnUrl: string | null = null): string {
  if (!returnUrl) {
    return '/auth/signup';
  }
  const encodedReturnUrl = encodeURIComponent(returnUrl);
  return `/auth/signup?returnTo=${encodedReturnUrl}`;
}

/**
 * Validates and sanitizes a redirect URL
 */
export function validateRedirectUrl(url: string | null, fallbackUrl: string = '/restaurants'): string {
  if (!url) return fallbackUrl;
  
  try {
    const redirectUrl = new URL(url, window.location.origin);
    
    // Ensure it's the same origin (security)
    if (redirectUrl.origin !== window.location.origin) {
      return fallbackUrl;
    }
    
    // Don't redirect back to auth pages
    if (redirectUrl.pathname.startsWith('/auth/')) {
      return fallbackUrl;
    }
    
    return url;
  } catch {
    return fallbackUrl;
  }
}

/**
 * Gets the current page URL for redirect purposes
 */
export function getCurrentPageUrl(): string {
  return window.location.pathname + window.location.search;
}

/**
 * Redirects to login with current page as return URL
 */
export function redirectToLogin(fallbackUrl: string = '/restaurants'): void {
  const currentUrl = getCurrentPageUrl();
  const loginUrl = createLoginUrl(currentUrl);
  window.location.href = loginUrl;
}

/**
 * Redirects to signup with current page as return URL
 */
export function redirectToSignup(fallbackUrl: string = '/restaurants'): void {
  const currentUrl = getCurrentPageUrl();
  const signupUrl = createSignupUrl(currentUrl);
  window.location.href = signupUrl;
}

// ==================== Session Storage Helpers ====================

const SESSION_STORAGE_KEY = 'supabase.auth.token';

/**
 * Checks if session data exists in storage
 */
export function hasSessionInStorage(): boolean {
  if (typeof window === 'undefined') return false;
  
  const hasCookie = document.cookie.includes(SESSION_STORAGE_KEY);
  const hasLocalStorage = !!localStorage.getItem(SESSION_STORAGE_KEY);
  
  if (process.env.NODE_ENV === 'development') {
    authLogger.log({
      type: 'session_expired',
      timestamp: Date.now(),
      details: {
        storageCheck: true,
        hasCookie,
        hasLocalStorage
      }
    });
  }
  
  return hasCookie || hasLocalStorage;
}

/**
 * Clears session data from storage
 */
export function clearSessionStorage(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(SESSION_STORAGE_KEY);
  logStorageOperation('remove', SESSION_STORAGE_KEY);
}

// Export for debugging in browser console
if (typeof window !== 'undefined') {
  (window as any).__authLogger = authLogger;
}