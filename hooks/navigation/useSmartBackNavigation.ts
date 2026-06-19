import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

interface UseSmartBackNavigationOptions {
  fallbackRoute?: string;
  userContext?: 'authenticated' | 'anonymous';
}

export const useSmartBackNavigation = (options: UseSmartBackNavigationOptions = {}) => {
  const router = useRouter();
  const { fallbackRoute = '/restaurants', userContext = 'anonymous' } = options;

  const navigateBack = useCallback(() => {
    // Check if we have a referrer and it's not the same page
    const referrer = document.referrer;
    const currentPath = window.location.pathname;
    
    // If there's a referrer and it's different from current page, use browser back
    if (referrer && !referrer.includes(currentPath)) {
      router.back();
      return;
    }

    // If no referrer or same page, determine fallback based on user context
    let destination = fallbackRoute;

    // For authenticated users, provide more options
    if (userContext === 'authenticated') {
      // Check if we came from user search or lists
      const urlParams = new URLSearchParams(window.location.search);
      const source = urlParams.get('source');
      
      if (source === 'search') {
        destination = '/users/search';
      } else if (source === 'lists') {
        destination = '/lists';
      } else if (source === 'restaurants') {
        destination = '/restaurants';
      }
    }

    // Navigate to the determined destination
    router.push(destination);
  }, [router, fallbackRoute, userContext]);

  return { navigateBack };
};