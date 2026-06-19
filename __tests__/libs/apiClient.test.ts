import { apiClient } from '@/libs/apiClient';

describe('apiClient', () => {
  let consoleErrorSpy: jest.SpyInstance;
  beforeEach(() => { consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {}); });
  afterEach(() => { consoleErrorSpy.mockRestore(); apiClient.clearCache(); apiClient.setAuthToken(null); });

  describe('setAuthToken / getAuthToken', () => {
    it('sets and gets auth token', () => { apiClient.setAuthToken('test-token'); expect(apiClient.getAuthToken()).toBe('test-token'); });
    it('clears auth token with null', () => { apiClient.setAuthToken('test-token'); apiClient.setAuthToken(null); expect(apiClient.getAuthToken()).toBeNull(); });
  });
  describe('cache management', () => {
    it('clears cache', () => { apiClient.clearCache(); expect(apiClient.getCacheStats().size).toBe(0); });
    it('returns cache stats', () => { const s = apiClient.getCacheStats(); expect(s).toHaveProperty('size'); expect(Array.isArray(s.keys)).toBe(true); });
  });
  describe('interceptors', () => {
    it('adds and removes request interceptor', () => { const r = apiClient.addRequestInterceptor((url, options) => options); expect(typeof r).toBe('function'); r(); });
    it('adds and removes response interceptor', () => { const r = apiClient.addResponseInterceptor(() => {}); expect(typeof r).toBe('function'); r(); });
  });
  describe('apiClient exports', () => {
    it('has all required methods', () => {
      expect(typeof apiClient.get).toBe('function');
      expect(typeof apiClient.post).toBe('function');
      expect(typeof apiClient.put).toBe('function');
      expect(typeof apiClient.patch).toBe('function');
      expect(typeof apiClient.delete).toBe('function');
      expect(typeof apiClient.invalidateCache).toBe('function');
      expect(typeof apiClient.clearCache).toBe('function');
      expect(typeof apiClient.setAuthToken).toBe('function');
      expect(typeof apiClient.getAuthToken).toBe('function');
      expect(typeof apiClient.addRequestInterceptor).toBe('function');
      expect(typeof apiClient.addResponseInterceptor).toBe('function');
      expect(typeof apiClient.getCacheStats).toBe('function');
      expect(typeof apiClient.getPendingRequests).toBe('function');
    });
  });
});