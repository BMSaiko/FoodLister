// Search Worker for Roulette Filter System
// Handles heavy search operations in background thread

self.onmessage = function(e) {
  const { items, query, fields } = e.data;
  
  // Perform search operation
  const results = performSearch(items, query, fields);
  
  // Return results to main thread
  self.postMessage({ results });
};

function performSearch(items, query, fields) {
  if (!query || query.trim().length < 2) {
    return items;
  }

  const normalizedQuery = query.toLowerCase().trim();
  
  // Use optimized search algorithm
  return items.filter(item => {
    return fields.some(field => {
      const fieldValue = item[field];
      if (!fieldValue) return false;
      
      // Use indexOf for better performance than includes
      return String(fieldValue).toLowerCase().indexOf(normalizedQuery) !== -1;
    });
  });
}

// Performance monitoring for worker
let searchCount = 0;
let totalTime = 0;

self.onmessage = function(e) {
  const startTime = performance.now();
  const { items, query, fields } = e.data;
  
  const results = performSearch(items, query, fields);
  
  const endTime = performance.now();
  const searchTime = endTime - startTime;
  
  searchCount++;
  totalTime += searchTime;
  
  // Log performance stats periodically
  if (searchCount % 10 === 0) {
    console.log(`Worker Search Stats: ${searchCount} searches, avg: ${(totalTime / searchCount).toFixed(2)}ms`);
  }
  
  self.postMessage({ 
    results, 
    searchTime,
    searchCount 
  });
};