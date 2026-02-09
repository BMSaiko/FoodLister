/**
 * Performance Monitoring and Logging Utilities
 * Tracks API response times, database query performance, and client-side metrics
 */

interface PerformanceMetrics {
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

interface DatabaseMetrics {
  query: string;
  executionTime: number;
  timestamp: number;
  rowsReturned: number;
  userId?: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private dbMetrics: DatabaseMetrics[] = [];
  private readonly MAX_METRICS = 1000;
  private readonly LOG_THRESHOLD = 1000; // Log slow requests over 1 second

  /**
   * Log API response time
   */
  logApiResponse(metrics: Omit<PerformanceMetrics, 'timestamp'>) {
    const metric: PerformanceMetrics = {
      ...metrics,
      timestamp: Date.now()
    };

    // Add to metrics array
    this.metrics.push(metric);
    
    // Keep only last MAX_METRICS entries
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics.shift();
    }

    // Log slow requests
    if (metrics.responseTime > this.LOG_THRESHOLD) {
      console.warn(`Slow API response: ${metrics.apiEndpoint} took ${metrics.responseTime}ms`, {
        userId: metrics.userId,
        page: metrics.page,
        limit: metrics.limit,
        cursor: metrics.cursor,
        cacheHit: metrics.cacheHit
      });
    }

    // Store in localStorage for persistence
    this.persistMetrics();
  }

  /**
   * Log database query performance
   */
  logDatabaseQuery(metrics: Omit<DatabaseMetrics, 'timestamp'>) {
    const metric: DatabaseMetrics = {
      ...metrics,
      timestamp: Date.now()
    };

    this.dbMetrics.push(metric);
    
    if (this.dbMetrics.length > this.MAX_METRICS) {
      this.dbMetrics.shift();
    }

    // Log slow database queries
    if (metrics.executionTime > 500) { // Log queries over 500ms
      console.warn(`Slow database query: ${metrics.query.substring(0, 100)}... took ${metrics.executionTime}ms`, {
        rowsReturned: metrics.rowsReturned,
        userId: metrics.userId
      });
    }

    this.persistDbMetrics();
  }

  /**
   * Measure function execution time
   */
  async measureFunction<T>(
    fn: () => Promise<T>,
    label: string,
    context?: { userId?: string; page?: number; limit?: number; cursor?: string }
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
        cacheHit: false // This would be set by the calling function
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
   * Measure database query execution time
   */
  async measureDatabaseQuery<T>(
    query: string,
    fn: () => Promise<T>,
    userId?: string
  ): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await fn();
      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // Estimate rows returned (this would need to be passed from the actual query result)
      const rowsReturned = Array.isArray(result) ? result.length : (result ? 1 : 0);

      this.logDatabaseQuery({
        query,
        executionTime,
        rowsReturned,
        userId
      });

      return result;
    } catch (error) {
      const endTime = performance.now();
      const executionTime = endTime - startTime;

      this.logDatabaseQuery({
        query,
        executionTime,
        rowsReturned: 0,
        userId
      });

      throw error;
    }
  }

  /**
   * Get performance statistics
   */
  getStats() {
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
    const slowRequests = recentMetrics.filter(m => m.responseTime > this.LOG_THRESHOLD).length;
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
   * Get database performance statistics
   */
  getDbStats() {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    const recentMetrics = this.dbMetrics.filter(m => m.timestamp > oneHourAgo);

    if (recentMetrics.length === 0) {
      return {
        totalQueries: 0,
        avgExecutionTime: 0,
        maxExecutionTime: 0,
        minExecutionTime: 0,
        slowQueries: 0,
        totalRowsReturned: 0
      };
    }

    const executionTimes = recentMetrics.map(m => m.executionTime);
    const totalQueries = recentMetrics.length;
    const avgExecutionTime = executionTimes.reduce((a, b) => a + b, 0) / totalQueries;
    const maxExecutionTime = Math.max(...executionTimes);
    const minExecutionTime = Math.min(...executionTimes);
    const slowQueries = recentMetrics.filter(m => m.executionTime > 500).length;
    const totalRowsReturned = recentMetrics.reduce((sum, m) => sum + m.rowsReturned, 0);

    return {
      totalQueries,
      avgExecutionTime: Math.round(avgExecutionTime),
      maxExecutionTime,
      minExecutionTime,
      slowQueries,
      totalRowsReturned
    };
  }

  /**
   * Get detailed performance report
   */
  getPerformanceReport() {
    const apiStats = this.getStats();
    const dbStats = this.getDbStats();
    
    return {
      timestamp: new Date().toISOString(),
      api: apiStats,
      database: dbStats,
      recommendations: this.generateRecommendations(apiStats, dbStats)
    };
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(apiStats: any, dbStats: any) {
    const recommendations: string[] = [];

    if (apiStats.avgResponseTime > 1000) {
      recommendations.push('API response times are high. Consider implementing more aggressive caching.');
    }

    if (apiStats.slowRequests > apiStats.totalRequests * 0.1) {
      recommendations.push('High percentage of slow requests. Review database indexes and query optimization.');
    }

    if (apiStats.errorRate > 5) {
      recommendations.push('High error rate detected. Review error handling and server logs.');
    }

    if (dbStats.avgExecutionTime > 500) {
      recommendations.push('Database queries are slow. Review indexes and query patterns.');
    }

    if (dbStats.slowQueries > dbStats.totalQueries * 0.05) {
      recommendations.push('High percentage of slow database queries. Consider query optimization.');
    }

    if (recommendations.length === 0) {
      recommendations.push('Performance looks good! Continue monitoring.');
    }

    return recommendations;
  }

  /**
   * Clear all metrics
   */
  clearMetrics() {
    this.metrics = [];
    this.dbMetrics = [];
    localStorage.removeItem('performance_metrics');
    localStorage.removeItem('db_metrics');
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics() {
    return {
      apiMetrics: this.metrics,
      dbMetrics: this.dbMetrics,
      report: this.getPerformanceReport()
    };
  }

  /**
   * Persist metrics to localStorage
   */
  private persistMetrics() {
    try {
      localStorage.setItem('performance_metrics', JSON.stringify(this.metrics));
    } catch (error) {
      console.warn('Could not persist performance metrics:', error);
    }
  }

  /**
   * Persist database metrics to localStorage
   */
  private persistDbMetrics() {
    try {
      localStorage.setItem('db_metrics', JSON.stringify(this.dbMetrics));
    } catch (error) {
      console.warn('Could not persist database metrics:', error);
    }
  }

  /**
   * Load metrics from localStorage
   */
  loadMetrics() {
    try {
      const apiMetrics = localStorage.getItem('performance_metrics');
      const dbMetrics = localStorage.getItem('db_metrics');
      
      if (apiMetrics) {
        this.metrics = JSON.parse(apiMetrics);
      }
      
      if (dbMetrics) {
        this.dbMetrics = JSON.parse(dbMetrics);
      }
    } catch (error) {
      console.warn('Could not load persisted metrics:', error);
    }
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Initialize by loading existing metrics
performanceMonitor.loadMetrics();

// Export convenience functions
export const logApiResponse = performanceMonitor.logApiResponse.bind(performanceMonitor);
export const logDatabaseQuery = performanceMonitor.logDatabaseQuery.bind(performanceMonitor);
export const measureFunction = performanceMonitor.measureFunction.bind(performanceMonitor);
export const measureDatabaseQuery = performanceMonitor.measureDatabaseQuery.bind(performanceMonitor);
export const getPerformanceReport = performanceMonitor.getPerformanceReport.bind(performanceMonitor);

// Auto-report performance every 5 minutes in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  setInterval(() => {
    const report = performanceMonitor.getPerformanceReport();
    if (report.api.totalRequests > 0) {
      console.log('Performance Report:', report);
    }
  }, 5 * 60 * 1000);
}

export default performanceMonitor;