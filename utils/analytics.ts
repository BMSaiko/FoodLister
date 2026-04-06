// Analytics utility for tracking user actions

export type AnalyticsEvent = {
  event: string;
  properties?: Record<string, any>;
  timestamp?: string;
};

// Track user actions
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  const event: AnalyticsEvent = {
    event: eventName,
    properties,
    timestamp: new Date().toISOString(),
  };

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', event);
  }

  // Send to analytics endpoint if configured
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_ANALYTICS_URL) {
    fetch(process.env.NEXT_PUBLIC_ANALYTICS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
      keepalive: true,
    }).catch(() => {});
  }
}

// Common event names
export const Events = {
  // List events
  LIST_CREATED: 'list_created',
  LIST_DELETED: 'list_deleted',
  LIST_DUPLICATED: 'list_duplicated',
  LIST_SHARED: 'list_shared',
  COLLABORATOR_ADDED: 'collaborator_added',
  COLLABORATOR_REMOVED: 'collaborator_removed',
  COMMENT_ADDED: 'comment_added',
  
  // Restaurant events
  RESTAURANT_CREATED: 'restaurant_created',
  RESTAURANT_VIEWED: 'restaurant_viewed',
  RESTAURANT_ADDED_TO_LIST: 'restaurant_added_to_list',
  ROULETTE_SPIN: 'roulette_spin',
  
  // Review events
  REVIEW_CREATED: 'review_created',
  REVIEW_DELETED: 'review_deleted',
  
  // Search events
  SEARCH_PERFORMED: 'search_performed',
  FILTER_APPLIED: 'filter_applied',
  FILTER_CLEARED: 'filter_cleared',
} as const;