/**
 * Unit tests for API Monitor
 */

import { apiMonitor, ApiMonitor } from '../apiMonitor';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn()
};

Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage
});

// Mock performance.now
const mockPerformanceNow = jest.fn(() => 1000);
Object.defineProperty(global, 'performance', {
  value: { now: mockPerformanceNow },
  writable: true
});

describe('ApiMonitor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  describe('logApiResponse', () => {
    it('should log API response metrics', () => {
      apiMonitor.logApiResponse({
        apiEndpoint: '/api/test',
        responseTime: 100
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'performance_metrics',
        expect.any(String)
      );
    });

    it('should keep only last MAX_METRICS entries', () => {
      // This would require creating a new instance to test the limit
      const monitor = new (ApiMonitor as any)();
      
      for (let i = 0; i < 1001; i++) {
        monitor.logApiResponse({
          apiEndpoint: '/api/test',
          responseTime: 100
        });
      }

      const stats = monitor.getStats();
      expect(stats.totalRequests).toBeLessThanOrEqual(1000);
    });
  });

  describe('getStats', () => {
    it('should return zero stats when no metrics', () => {
      const monitor = new (ApiMonitor as any)();
      const stats = monitor.getStats();

      expect(stats).toEqual({
        totalRequests: 0,
        avgResponseTime: 0,
        maxResponseTime: 0,
        minResponseTime: 0,
        slowRequests: 0,
        errorRate: 0
      });
    });

    it('should calculate correct stats from metrics', () => {
      const monitor = new (ApiMonitor as any)();
      
      monitor.logApiResponse({ apiEndpoint: '/api/1', responseTime: 100 });
      monitor.logApiResponse({ apiEndpoint: '/api/2', responseTime: 200 });
      monitor.logApiResponse({ apiEndpoint: '/api/3', responseTime: 300 });

      const stats = monitor.getStats();

      expect(stats.totalRequests).toBe(3);
      expect(stats.avgResponseTime).toBe(200);
      expect(stats.maxResponseTime).toBe(300);
      expect(stats.minResponseTime).toBe(100);
    });

    it('should count slow requests correctly', () => {
      const monitor = new (ApiMonitor as any)();
      
      monitor.logApiResponse({ apiEndpoint: '/api/fast', responseTime: 100 });
      monitor.logApiResponse({ apiEndpoint: '/api/slow', responseTime: 1500 });
      monitor.logApiResponse({ apiEndpoint: '/api/slower', responseTime: 2000 });

      const stats = monitor.getStats();

      expect(stats.slowRequests).toBe(2);
    });

    it('should calculate error rate correctly', () => {
      const monitor = new (ApiMonitor as any)();
      
      monitor.logApiResponse({ apiEndpoint: '/api/1', responseTime: 100 });
      monitor.logApiResponse({ apiEndpoint: '/api/2', responseTime: 100, error: 'Test error' });

      const stats = monitor.getStats();

      expect(stats.errorRate).toBe(50);
    });
  });

  describe('measureFunction', () => {
    it('should measure successful function execution', async () => {
      const monitor = new (ApiMonitor as any)();
      mockPerformanceNow.mockReturnValueOnce(1000).mockReturnValueOnce(1100);

      const result = await monitor.measureFunction(
        async () => 'success',
        'test-function'
      );

      expect(result).toBe('success');
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it('should log errors and rethrow', async () => {
      const monitor = new (ApiMonitor as any)();
      mockPerformanceNow.mockReturnValueOnce(1000).mockReturnValueOnce(1100);

      await expect(
        monitor.measureFunction(
          async () => { throw new Error('Test error'); },
          'test-function'
        )
      ).rejects.toThrow('Test error');
    });
  });

  describe('generateRecommendations', () => {
    it('should recommend caching for high response times', () => {
      const monitor = new (ApiMonitor as any)();
      const stats = { avgResponseTime: 1500, totalRequests: 100, slowRequests: 5, errorRate: 2 };
      
      const recommendations = monitor.generateRecommendations(stats);
      
      expect(recommendations).toContain(
        'API response times are high. Consider implementing more aggressive caching.'
      );
    });

    it('should recommend review for high slow request percentage', () => {
      const monitor = new (ApiMonitor as any)();
      const stats = { avgResponseTime: 500, totalRequests: 100, slowRequests: 15, errorRate: 2 };
      
      const recommendations = monitor.generateRecommendations(stats);
      
      expect(recommendations).toContain(
        'High percentage of slow requests. Review database indexes and query optimization.'
      );
    });

    it('should recommend review for high error rate', () => {
      const monitor = new (ApiMonitor as any)();
      const stats = { avgResponseTime: 500, totalRequests: 100, slowRequests: 5, errorRate: 10 };
      
      const recommendations = monitor.generateRecommendations(stats);
      
      expect(recommendations).toContain(
        'High error rate detected. Review error handling and server logs.'
      );
    });

    it('should return positive message when performance is good', () => {
      const monitor = new (ApiMonitor as any)();
      const stats = { avgResponseTime: 200, totalRequests: 100, slowRequests: 2, errorRate: 1 };
      
      const recommendations = monitor.generateRecommendations(stats);
      
      expect(recommendations).toContain('API performance looks good! Continue monitoring.');
    });
  });

  describe('clearMetrics', () => {
    it('should clear all metrics', () => {
      const monitor = new (ApiMonitor as any)();
      
      monitor.logApiResponse({ apiEndpoint: '/api/test', responseTime: 100 });
      monitor.clearMetrics();
      
      const stats = monitor.getStats();
      expect(stats.totalRequests).toBe(0);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('performance_metrics');
    });
  });

  describe('exportMetrics', () => {
    it('should export all metrics with stats and recommendations', () => {
      const monitor = new (ApiMonitor as any)();
      
      monitor.logApiResponse({ apiEndpoint: '/api/test', responseTime: 100 });
      
      const exported = monitor.exportMetrics();
      
      expect(exported).toHaveProperty('metrics');
      expect(exported).toHaveProperty('stats');
      expect(exported).toHaveProperty('recommendations');
      expect(Array.isArray(exported.metrics)).toBe(true);
      expect(exported.metrics.length).toBe(1);
    });
  });
});