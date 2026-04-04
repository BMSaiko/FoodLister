/**
 * Performance Monitoring - Re-exports from split modules
 * For new code, import directly from apiMonitor.ts or dbMonitor.ts
 */

// Re-export API monitor
export {
  apiMonitor,
  logApiResponse,
  measureFunction,
  getApiStats
} from './apiMonitor';

// Re-export database monitor
export {
  dbMonitor,
  logDatabaseQuery,
  measureDatabaseQuery,
  getDbStats
} from './dbMonitor';

// Combined report for convenience
import { apiMonitor } from './apiMonitor';
import { dbMonitor } from './dbMonitor';

export function getPerformanceReport() {
  const apiStats = apiMonitor.getStats();
  const dbStats = dbMonitor.getStats();
  
  return {
    timestamp: new Date().toISOString(),
    api: apiStats,
    database: dbStats,
    recommendations: [
      ...apiMonitor.generateRecommendations(apiStats),
      ...dbMonitor.generateRecommendations(dbStats)
    ]
  };
}

// Auto-report performance every 5 minutes in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  setInterval(() => {
    const report = getPerformanceReport();
    if (report.api.totalRequests > 0) {
      console.log('Performance Report:', report);
    }
  }, 5 * 60 * 1000);
}

export default { apiMonitor, dbMonitor, getPerformanceReport };