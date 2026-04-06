// Hooks index file - Central exports for all hooks

// Auth hooks
export { useAuth } from './auth/useAuth';
export { useSession } from './auth/useSession';
export { useAuthActions } from './auth/useAuthActions';
export { useApiClient } from './auth/useApiClient';
export { usePublicApiClient } from './auth/usePublicApiClient';
export { useSecureApiClient } from './auth/useSecureApiClient';

// Data hooks
export { useUserData } from './data/useUserData';
export { useRestaurants } from './data/useRestaurants';
export { useSettings } from './data/useSettings';
export { useVisitsData } from './data/useVisitsData';
export { useUserCache } from './data/useUserCache';
export { useApiMutation } from './data/useApiMutation';
export { useScheduledMeals } from './data/useScheduledMeals';

// Form hooks
export { useForm } from './forms/useForm';
export { useImageUpload } from './forms/useImageUpload';
export { useListForm } from './forms/useListForm';
export { useRestaurantForm } from './forms/useRestaurantForm';
export { useMealScheduling } from './forms/useMealScheduling';

// List hooks
export * from './lists';

// Navigation hooks
export { useSmartBackNavigation } from './navigation/useSmartBackNavigation';

// UI hooks
export * from './ui';

// Utility hooks
export { useLocalStorage } from './utilities/useLocalStorage';
export { useDebounce, useDebouncedCallback } from './utilities/useDebounce';