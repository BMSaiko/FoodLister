/**
 * search.ts - Restaurant search utilities
 * Provides search functionality for restaurants with various criteria
 */

export interface SearchOptions {
  query?: string;
  cuisineTypes?: string[];
  dietaryOptions?: string[];
  features?: string[];
  minRating?: number;
  maxRating?: number;
  location?: string;
  sortBy?: 'name' | 'rating' | 'reviews' | 'created_at';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

/**
 * Build query parameters for restaurant search API
 */
export function buildSearchParams(options: SearchOptions): URLSearchParams {
  const params = new URLSearchParams();

  if (options.query) {
    params.set('q', options.query);
  }

  if (options.cuisineTypes && options.cuisineTypes.length > 0) {
    params.set('cuisine_types', options.cuisineTypes.join(','));
  }

  if (options.dietaryOptions && options.dietaryOptions.length > 0) {
    params.set('dietary_options', options.dietaryOptions.join(','));
  }

  if (options.features && options.features.length > 0) {
    params.set('features', options.features.join(','));
  }

  if (options.minRating !== undefined) {
    params.set('min_rating', options.minRating.toString());
  }

  if (options.maxRating !== undefined) {
    params.set('max_rating', options.maxRating.toString());
  }

  if (options.location) {
    params.set('location', options.location);
  }

  if (options.sortBy) {
    params.set('sort_by', options.sortBy);
  }

  if (options.sortOrder) {
    params.set('sort_order', options.sortOrder);
  }

  if (options.page) {
    params.set('page', options.page.toString());
  }

  if (options.limit) {
    params.set('limit', options.limit.toString());
  }

  return params;
}

/**
 * Build search URL with parameters
 */
export function buildSearchUrl(options: SearchOptions): string {
  const params = buildSearchParams(options);
  return `/api/restaurants?${params.toString()}`;
}

/**
 * Highlight search terms in text
 */
export function highlightText(text: string, query: string): string {
  if (!query || !text) return text;
  
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

/**
 * Escape special regex characters
 */
function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Debounced search function
 */
export function createSearchDebounced<T>(
  searchFn: (query: string) => Promise<T>,
  delay: number = 300
): (query: string) => Promise<T> {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastQuery = '';

  return async (query: string): Promise<T> => {
    lastQuery = query;
    
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    return new Promise((resolve, reject) => {
      timeoutId = setTimeout(async () => {
        try {
          const result = await searchFn(lastQuery);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, delay);
    });
  };
}