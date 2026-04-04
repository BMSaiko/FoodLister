/**
 * Data Hooks - Barrel Export
 * Export all data fetching hooks from a single entry point
 */

// API Query hooks (new optimized hooks)
export { 
  useApiQuery, 
  useApiPaginatedQuery,
  invalidateQuery,
  invalidateQueries,
  clearQueryCache
} from './useApiQuery';
export type { 
  UseApiQueryOptions, 
  UseApiQueryResult 
} from './useApiQuery';

// API Mutation hook
export { useApiMutation } from './useApiMutation';
export type { MutationResult, UseApiMutationOptions } from './useApiMutation';

// Data fetching hooks
export { useRestaurants } from './useRestaurants';
export { useUserData } from './useUserData';
export { useUserCache } from './useUserCache';
export { useVisitsData } from './useVisitsData';
export { useSettings } from './useSettings';