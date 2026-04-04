/**
 * Database Performance Monitor
 * Tracks database query execution times and generates recommendations
 */

interface DatabaseMetrics {
  query: string;
  executionTime: number;
  timestamp: number;
  rowsReturned: number;
  userId?: string;
}

interface DbStats {
  totalQueries: number;
  avgExecutionTime: number;
  maxExecutionTime: number;
  minExecutionTime: number;
  slowQueries: number;
  totalRowsReturned: number;
}

const STORAGE_KEY = 'db_metrics';
const MAX_METRICS = 1000;
const SLOW_QUERY_THRESHOLD = 500; // 500ms

export class DbMonitor {
  private metrics: DatabaseMetrics[] = [];

  constructor() {
    this.loadMetrics();
  }

  /**
   * Log database query performance
   */
  logDatabaseQuery(metrics: Omit<DatabaseMetrics, 'timestamp'>) {
    const metric: DatabaseMetrics = {
      ...metrics,
      timestamp: Date.now()
    };

    this.metrics.push(metric);
    
    if (this.metrics.length > MAX_METRICS) {
      this.metrics.shift();
    }

    if (metrics.executionTime > SLOW_QUERY_THRESHOLD) {
      console.warn(`Slow database query: ${metrics.query.substring(0, 100)}... took ${metrics.executionTime}ms`, {
        rowsReturned: metrics.rowsReturned,
        userId: metrics.userId
      });
    }

    this.persistMetrics();
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
   * Get database performance statistics
   */
  getStats(): DbStats {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    const recentMetrics = this.metrics.filter(m => m.timestamp > oneHourAgo);

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
    const slowQueries = recentMetrics.filter(m => m.executionTime > SLOW_QUERY_THRESHOLD).length;
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
   * Generate database performance recommendations
   */
  generateRecommendations(stats: DbStats): string[] {
    const recommendations: string[] = [];

    if (stats.avgExecutionTime > 500) {
      recommendations.push('Database queries are slow. Review indexes and query patterns.');
    }

    if (stats.totalQueries > 0 && stats.slowQueries > stats.totalQueries * 0.05) {
      recommendations.push('High percentage of slow database queries. Consider query optimization.');
    }

    if (recommendations.length === 0) {
      recommendations.push('Database performance looks good! Continue monitoring.');
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
      console.warn('Could not persist database performance metrics:', error);
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
      console.warn('Could not load persisted database metrics:', error);
    }
  }
}

// Create singleton instance
export const dbMonitor = new DbMonitor();

// Export class for testing
export { DbMonitor };

// Export convenience functions
export const logDatabaseQuery = dbMonitor.logDatabaseQuery.bind(dbMonitor);
export const measureDatabaseQuery = dbMonitor.measureDatabaseQuery.bind(dbMonitor);
export const getDbStats = dbMonitor.getStats.bind(dbMonitor);

export default dbMonitor;