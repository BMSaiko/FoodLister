/**
 * API Performance Monitor
 * Tracks API response times, error rates, and generates recommendations
 */

interface ApiPerformanceMetrics {
  apiEndpoint: string;
  responseTime: number;
  timestamp: number;
  userId?: string;
  page?: number;
  limit?: number;
  cursor?: string;
  cacheHit?: boolean;
  error?: string;
}

interface ApiStats {
  totalRequests: number;
  avgResponseTime: number;
  maxResponseTime: number;
  minResponseTime: number;
  slowRequests: number;
  errorRate: number;
}

const STORAGE_KEY = 'performance_metrics';
const MAX_METRICS = 1000;
const SLOW_THRESHOLD = 1000; // 1 second

export class ApiMonitor {
  private metrics: ApiPerformanceMetrics[] = [];

  constructor() {
    this.loadMetrics();
  }

  /**
   * Log API response time
   */
  logApiResponse(metrics: Omit<ApiPerformanceMetrics, 'timestamp'>) {
    const metric: ApiPerformanceMetrics = {
      ...metrics,
      timestamp: Date.now()
    };

    this.metrics.push(metric);
    
    if (this.metrics.length > MAX_METRICS) {
      this.metrics.shift();
    }

    if (metrics.responseTime > SLOW_THRESHOLD) {
      console.warn(`Slow API response: ${metrics.apiEndpoint} took ${metrics.responseTime}ms`, {
        userId: metrics.userId,
        page: metrics.page,
        limit: metrics.limit,
        cursor: metrics.cursor,
        cacheHit: metrics.cacheHit
      });
    }

    this.persistMetrics();
  }

  /**
   * Measure function execution time
   */
  async measureFunction<T>(
    fn: () => Promise<T>,
    label: string,
    context?: { userId?: string; page?: number; limit?: number; cursor?: string; cacheHit?: boolean }
  ): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await fn();
      const endTime = performance.now();
      const responseTime = endTime - startTime;

      this.logApiResponse({
        apiEndpoint: label,
        responseTime,
        userId: context?.userId,
        page: context?.page,
        limit: context?.limit,
        cursor: context?.cursor,
        cacheHit: context?.cacheHit
      });

      return result;
    } catch (error) {
      const endTime = performance.now();
      const responseTime = endTime - startTime;

      this.logApiResponse({
        apiEndpoint: label,
        responseTime,
        userId: context?.userId,
        page: context?.page,
        limit: context?.limit,
        cursor: context?.cursor,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      throw error;
    }
  }

  /**
   * Get API performance statistics
   */
  getStats(): ApiStats {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    const recentMetrics = this.metrics.filter(m => m.timestamp > oneHourAgo);

    if (recentMetrics.length === 0) {
      return {
        totalRequests: 0,
        avgResponseTime: 0,
        maxResponseTime: 0,
        minResponseTime: 0,
        slowRequests: 0,
        errorRate: 0
      };
    }

    const responseTimes = recentMetrics.map(m => m.responseTime);
    const totalRequests = recentMetrics.length;
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / totalRequests;
    const maxResponseTime = Math.max(...responseTimes);
    const minResponseTime = Math.min(...responseTimes);
    const slowRequests = recentMetrics.filter(m => m.responseTime > SLOW_THRESHOLD).length;
    const errors = recentMetrics.filter(m => m.error).length;
    const errorRate = (errors / totalRequests) * 100;

    return {
      totalRequests,
      avgResponseTime: Math.round(avgResponseTime),
      maxResponseTime,
      minResponseTime,
      slowRequests,
      errorRate: Math.round(errorRate * 100) / 100
    };
  }

  /**
   * Generate API performance recommendations
   */
  generateRecommendations(stats: ApiStats): string[] {
    const recommendations: string[] = [];

    if (stats.avgResponseTime > 1000) {
      recommendations.push('API response times are high. Consider implementing more aggressive caching.');
    }

    if (stats.totalRequests > 0 && stats.slowRequests > stats.totalRequests * 0.1) {
      recommendations.push('High percentage of slow requests. Review database indexes and query optimization.');
    }

    if (stats.errorRate > 5) {
      recommendations.push('High error rate detected. Review error handling and server logs.');
    }

    if (recommendations.length === 0) {
      recommendations.push('API performance looks good! Continue monitoring.');
    }

    return recommendations;
  }

  /**
   * Clear all metrics
   */
  clearMetrics() {
    this.metrics = [];
    localStorage.removeItem(STORAGE_KEY);
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics() {
    return {
      metrics: this.metrics,
      stats: this.getStats(),
      recommendations: this.generateRecommendations(this.getStats())
    };
  }

  /**
   * Persist metrics to localStorage
   */
  private persistMetrics() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.metrics));
    } catch (error) {
      console.warn('Could not persist API performance metrics:', error);
    }
  }

  /**
   * Load metrics from localStorage
   */
  private loadMetrics() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.metrics = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Could not load persisted API metrics:', error);
    }
  }
}

// Create singleton instance
export const apiMonitor = new ApiMonitor();

// Export convenience functions
export const logApiResponse = apiMonitor.logApiResponse.bind(apiMonitor);
export const measureFunction = apiMonitor.measureFunction.bind(apiMonitor);
export const getApiStats = apiMonitor.getStats.bind(apiMonitor);

export default apiMonitor;