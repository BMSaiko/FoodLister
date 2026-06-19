/**
 * Unit tests for Database Monitor
 */

import { dbMonitor, DbMonitor } from '../dbMonitor';

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

describe('DbMonitor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  describe('logDatabaseQuery', () => {
    it('should log database query metrics', () => {
      dbMonitor.logDatabaseQuery({
        query: 'SELECT * FROM users',
        executionTime: 50,
        rowsReturned: 10
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'db_metrics',
        expect.any(String)
      );
    });

    it('should keep only last MAX_METRICS entries', () => {
      const monitor = new DbMonitor();
      
      for (let i = 0; i < 1001; i++) {
        monitor.logDatabaseQuery({
          query: 'SELECT 1',
          executionTime: 50,
          rowsReturned: 1
        });
      }

      const stats = monitor.getStats();
      expect(stats.totalQueries).toBeLessThanOrEqual(1000);
    });
  });

  describe('getStats', () => {
    it('should return zero stats when no metrics', () => {
      const monitor = new DbMonitor();
      const stats = monitor.getStats();

      expect(stats).toEqual({
        totalQueries: 0,
        avgExecutionTime: 0,
        maxExecutionTime: 0,
        minExecutionTime: 0,
        slowQueries: 0,
        totalRowsReturned: 0
      });
    });

    it('should calculate correct stats from metrics', () => {
      const monitor = new DbMonitor();
      
      monitor.logDatabaseQuery({ query: 'Q1', executionTime: 100, rowsReturned: 5 });
      monitor.logDatabaseQuery({ query: 'Q2', executionTime: 200, rowsReturned: 10 });
      monitor.logDatabaseQuery({ query: 'Q3', executionTime: 300, rowsReturned: 15 });

      const stats = monitor.getStats();

      expect(stats.totalQueries).toBe(3);
      expect(stats.avgExecutionTime).toBe(200);
      expect(stats.maxExecutionTime).toBe(300);
      expect(stats.minExecutionTime).toBe(100);
      expect(stats.totalRowsReturned).toBe(30);
    });

    it('should count slow queries correctly', () => {
      const monitor = new DbMonitor();
      
      monitor.logDatabaseQuery({ query: 'Q1', executionTime: 100, rowsReturned: 1 });
      monitor.logDatabaseQuery({ query: 'Q2', executionTime: 600, rowsReturned: 1 });
      monitor.logDatabaseQuery({ query: 'Q3', executionTime: 800, rowsReturned: 1 });

      const stats = monitor.getStats();

      expect(stats.slowQueries).toBe(2);
    });
  });

  describe('measureDatabaseQuery', () => {
    it('should measure successful query execution', async () => {
      const monitor = new DbMonitor();
      mockPerformanceNow.mockReturnValueOnce(1000).mockReturnValueOnce(1100);

      const result = await monitor.measureDatabaseQuery(
        'SELECT * FROM users',
        async () => [{ id: 1 }]
      );

      expect(result).toEqual([{ id: 1 }]);
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it('should log errors and rethrow', async () => {
      const monitor = new DbMonitor();
      mockPerformanceNow.mockReturnValueOnce(1000).mockReturnValueOnce(1100);

      await expect(
        monitor.measureDatabaseQuery(
          'SELECT * FROM users',
          async () => { throw new Error('Query failed'); }
        )
      ).rejects.toThrow('Query failed');
    });
  });

  describe('generateRecommendations', () => {
    it('should recommend index review for slow queries', () => {
      const monitor = new DbMonitor();
      const stats = { avgExecutionTime: 600, totalQueries: 100, slowQueries: 5, totalRowsReturned: 500, maxExecutionTime: 800, minExecutionTime: 200 };
      
      const recommendations = monitor.generateRecommendations(stats);
      
      expect(recommendations).toContain(
        'Database queries are slow. Review indexes and query patterns.'
      );
    });

    it('should recommend optimization for high slow query percentage', () => {
      const monitor = new DbMonitor();
      const stats = { avgExecutionTime: 400, totalQueries: 100, slowQueries: 10, totalRowsReturned: 500, maxExecutionTime: 600, minExecutionTime: 100 };
      
      const recommendations = monitor.generateRecommendations(stats);
      
      expect(recommendations).toContain(
        'High percentage of slow database queries. Consider query optimization.'
      );
    });

    it('should return positive message when performance is good', () => {
      const monitor = new DbMonitor();
      const stats = { avgExecutionTime: 100, totalQueries: 100, slowQueries: 2, totalRowsReturned: 500, maxExecutionTime: 150, minExecutionTime: 50 };
      
      const recommendations = monitor.generateRecommendations(stats);
      
      expect(recommendations).toContain('Database performance looks good! Continue monitoring.');
    });
  });

  describe('clearMetrics', () => {
    it('should clear all metrics', () => {
      const monitor = new DbMonitor();
      
      monitor.logDatabaseQuery({ query: 'Q1', executionTime: 100, rowsReturned: 1 });
      monitor.clearMetrics();
      
      const stats = monitor.getStats();
      expect(stats.totalQueries).toBe(0);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('db_metrics');
    });
  });

  describe('exportMetrics', () => {
    it('should export all metrics with stats and recommendations', () => {
      const monitor = new DbMonitor();
      
      monitor.logDatabaseQuery({ query: 'Q1', executionTime: 100, rowsReturned: 5 });
      
      const exported = monitor.exportMetrics();
      
      expect(exported).toHaveProperty('metrics');
      expect(exported).toHaveProperty('stats');
      expect(exported).toHaveProperty('recommendations');
      expect(Array.isArray(exported.metrics)).toBe(true);
      expect(exported.metrics.length).toBe(1);
    });
  });
});