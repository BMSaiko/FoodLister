// Utility functions for authentication redirects

/**
 * Creates a login URL with returnTo parameter
 * @param {string} returnUrl - The URL to return to after successful login
 * @returns {string} - The login URL with returnTo parameter
 */
export function createLoginUrl(returnUrl = null) {
  if (!returnUrl) {
    return '/auth/signin';
  }
  
  // Encode the return URL to handle special characters
  const encodedReturnUrl = encodeURIComponent(returnUrl);
  return `/auth/signin?returnTo=${encodedReturnUrl}`;
}

/**
 * Creates a signup URL with returnTo parameter
 * @param {string} returnUrl - The URL to return to after successful signup
 * @returns {string} - The signup URL with returnTo parameter
 */
export function createSignupUrl(returnUrl = null) {
  if (!returnUrl) {
    return '/auth/signup';
  }
  
  // Encode the return URL to handle special characters
  const encodedReturnUrl = encodeURIComponent(returnUrl);
  return `/auth/signup?returnTo=${encodedReturnUrl}`;
}

/**
 * Validates and sanitizes a redirect URL
 * @param {string} url - The URL to validate
 * @param {string} fallbackUrl - The fallback URL if validation fails
 * @returns {string} - The validated redirect URL or fallback
 */
export function validateRedirectUrl(url, fallbackUrl = '/restaurants') {
  if (!url) return fallbackUrl;
  
  try {
    // Create URL object to validate
    const redirectUrl = new URL(url, window.location.origin);
    
    // Ensure it's the same origin (security)
    if (redirectUrl.origin !== window.location.origin) {
      return fallbackUrl;
    }
    
    // Don't redirect back to auth pages
    const pathname = redirectUrl.pathname;
    if (pathname.startsWith('/auth/')) {
      return fallbackUrl;
    }
    
    return url;
  } catch (error) {
    // Invalid URL, fallback to default
    return fallbackUrl;
  }
}

/**
 * Gets the current page URL for redirect purposes
 * @returns {string} - The current page URL
 */
export function getCurrentPageUrl() {
  return window.location.pathname + window.location.search;
}

/**
 * Redirects to login with current page as return URL
 * @param {string} fallbackUrl - Fallback URL if no current page
 */
export function redirectToLogin(fallbackUrl = '/restaurants') {
  const currentUrl = getCurrentPageUrl();
  const loginUrl = createLoginUrl(currentUrl);
  window.location.href = loginUrl;
}