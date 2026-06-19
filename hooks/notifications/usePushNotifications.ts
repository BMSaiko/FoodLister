'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';

interface PushNotificationState {
  supported: boolean;
  subscribed: boolean;
  loading: boolean;
  error: string | null;
}

export function usePushNotifications() {
  const { user } = useAuth();
  const [state, setState] = useState<PushNotificationState>({
    supported: false,
    subscribed: false,
    loading: false,
    error: null,
  });

  // Check if push notifications are supported
  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    setState((prev) => ({ ...prev, supported }));
  }, []);

  // Register service worker
  const registerServiceWorker = useCallback(async () => {
    if (!('serviceWorker' in navigator)) return null;
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
      return registration;
    } catch (err) {
      console.error('Service worker registration failed:', err);
      return null;
    }
  }, []);

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    if (!user || !state.supported) return false;

    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const registration = await registerServiceWorker();
      if (!registration) throw new Error('Service worker not available');

      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }

      // Get VAPID public key from server
      const response = await fetch('/api/notifications/push/vapid-key');
      const { key } = await response.json();

      if (!key) throw new Error('VAPID key not configured');

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key),
      });

      // Send subscription to server
      await fetch('/api/notifications/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          subscription: subscription.toJSON(),
        }),
      });

      setState((prev) => ({ ...prev, subscribed: true, loading: false }));
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to subscribe';
      setState((prev) => ({ ...prev, error: message, loading: false }));
      return false;
    }
  }, [user, state.supported, registerServiceWorker]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    if (!state.supported) return false;

    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        await fetch('/api/notifications/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
      }

      setState((prev) => ({ ...prev, subscribed: false, loading: false }));
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to unsubscribe';
      setState((prev) => ({ ...prev, error: message, loading: false }));
      return false;
    }
  }, [state.supported]);

  return {
    ...state,
    subscribe,
    unsubscribe,
  };
}

// Helper: Convert VAPID key from base64 to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
