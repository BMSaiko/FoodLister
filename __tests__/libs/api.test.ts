import {
  API_ENDPOINTS, HTTP_METHODS, createAuthHeaders, buildQueryString,
  buildRestaurantFilterParams, isAuthError, isRateLimitError,
} from '@/libs/api';

describe('api utilities', () => {
  describe('API_ENDPOINTS', () => {
    it('has correct restaurant endpoints', () => {
      expect(API_ENDPOINTS.restaurants).toBe('/api/restaurants');
      expect(API_ENDPOINTS.restaurant('123')).toBe('/api/restaurants/123');
      expect(API_ENDPOINTS.restaurantVisits('456')).toBe('/api/restaurants/456/visits');
      expect(API_ENDPOINTS.restaurantReviews('789')).toBe('/api/restaurants/789/reviews');
    });
    it('has correct list and auth endpoints', () => {
      expect(API_ENDPOINTS.lists).toBe('/api/lists');
      expect(API_ENDPOINTS.list('abc')).toBe('/api/lists/abc');
      expect(API_ENDPOINTS.auth.signIn).toBe('/api/auth/signin');
      expect(API_ENDPOINTS.auth.signUp).toBe('/api/auth/signup');
    });
    it('has correct filter endpoints', () => {
      expect(API_ENDPOINTS.cuisineTypes).toBe('/api/cuisine-types');
      expect(API_ENDPOINTS.dietaryOptions).toBe('/api/dietary-options');
    });
  });
  describe('HTTP_METHODS', () => {
    it('has all standard methods', () => {
      expect(HTTP_METHODS.GET).toBe('GET');
      expect(HTTP_METHODS.POST).toBe('POST');
      expect(HTTP_METHODS.PUT).toBe('PUT');
      expect(HTTP_METHODS.DELETE).toBe('DELETE');
    });
  });
  describe('createAuthHeaders', () => {
    it('returns Content-Type header without token', () => {
      expect(createAuthHeaders()).toEqual({ 'Content-Type': 'application/json' });
    });
    it('includes Authorization header with token', () => {
      expect(createAuthHeaders('my-token')).toEqual({
        'Content-Type': 'application/json', Authorization: 'Bearer my-token',
      });
    });
  });
  describe('buildQueryString', () => {
    it('returns empty string for empty params', () => { expect(buildQueryString({})).toBe(''); });
    it('builds query string from params', () => {
      const r = buildQueryString({ page: 1, limit: 10 });
      expect(r).toContain('page=1'); expect(r).toContain('limit=10'); expect(r.startsWith('?')).toBe(true);
    });
    it('skips undefined values', () => { expect(buildQueryString({ page: 1, search: undefined })).toBe('?page=1'); });
    it('handles boolean values', () => { expect(buildQueryString({ visited: true })).toBe('?visited=true'); });
  });
  describe('buildRestaurantFilterParams', () => {
    it('returns empty object for empty filters', () => { expect(buildRestaurantFilterParams({})).toEqual({}); });
    it('builds params from search filter', () => { expect(buildRestaurantFilterParams({ search: 'pizza' }).search).toBe('pizza'); });
    it('builds params from cuisine_types', () => { expect(buildRestaurantFilterParams({ cuisine_types: ['italian', 'japanese'] }).cuisine_types).toBe('italian,japanese'); });
    it('builds params from price_range', () => {
      const r = buildRestaurantFilterParams({ price_range: { min: 10, max: 50 } });
      expect(r.price_min).toBe('10'); expect(r.price_max).toBe('50');
    });
    it('builds params from visited flag', () => { expect(buildRestaurantFilterParams({ visited: true }).visited).toBe('true'); });
    it('skips empty arrays', () => { expect(buildRestaurantFilterParams({ cuisine_types: [] }).cuisine_types).toBeUndefined(); });
  });
  describe('isAuthError', () => {
    it('returns true for 401 code', () => { expect(isAuthError({ code: '401' })).toBe(true); });
    it('returns true for PGRST301 code', () => { expect(isAuthError({ code: 'PGRST301' })).toBe(true); });
    it('returns true for session_expired code', () => { expect(isAuthError({ code: 'session_expired' })).toBe(true); });
    it('returns true for auth messages', () => {
      expect(isAuthError({ message: 'invalid token' })).toBe(true);
      expect(isAuthError({ message: 'Token expired' })).toBe(true);
    });
    it('returns false for non-auth errors', () => { expect(isAuthError({ code: '500' })).toBe(false); expect(isAuthError(null)).toBe(false); });
  });
  describe('isRateLimitError', () => {
    it('returns true for 429 code', () => { expect(isRateLimitError({ code: '429' })).toBe(true); });
    it('returns true for 429 status', () => { expect(isRateLimitError({ status: 429 })).toBe(true); });
    it('returns false for non-rate-limit', () => { expect(isRateLimitError({ code: '401' })).toBe(false); expect(isRateLimitError(null)).toBe(false); });
  });
});