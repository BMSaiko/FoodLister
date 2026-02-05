'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/index';

interface VisitsData {
  [restaurantId: string]: {
    visited: boolean;
    visit_count: number;
  };
}

interface Restaurant {
  id: string;
  name: string;
  // Add other restaurant properties as needed
}

interface UseVisitsDataReturn {
  visitsData: VisitsData;
  loadingVisits: boolean;
  handleVisitsDataUpdate: (restaurantId: string, newVisitsData: { visited: boolean; visit_count: number }) => void;
}

export function useVisitsData(restaurants: Restaurant[], user: any): UseVisitsDataReturn {
  const [visitsData, setVisitsData] = useState<VisitsData>({});
  const [loadingVisits, setLoadingVisits] = useState<boolean>(false);
  const router = useRouter();
  const { getAccessToken, signOut } = useAuth();

  // Fetch visits data for all restaurants when user is authenticated and restaurants are loaded
  useEffect(() => {
    const fetchVisitsData = async () => {
      if (!user) {
        return;
      }

      if (restaurants.length === 0) {
        return;
      }

      setLoadingVisits(true);
      try {
        const token = await getAccessToken();
        if (!token) {
          setLoadingVisits(false);
          return;
        }

        const restaurantIds = restaurants.map(r => r.id);

        const response = await fetch('/api/restaurants/visits', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ restaurantIds }),
        });

        if (response.ok) {
          const data = await response.json();
          setVisitsData(data);
        } else if (response.status === 401) {
          // Retry once after a short delay to handle race condition after login
          console.warn('⚠️ Got 401, retrying after delay...');
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second

          const retryResponse = await fetch('/api/restaurants/visits', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ restaurantIds }),
          });

          if (retryResponse.ok) {
            const data = await retryResponse.json();
            setVisitsData(data);
          } else {
            console.error('❌ Authentication expired after retry, redirecting to signin');
            // Sign out and redirect to signin
            await signOut();
            return;
          }
        } else {
          console.error('❌ Failed to fetch visits data, status:', response.status);
          // Set default visits data on failure
          const defaultVisitsData: VisitsData = {};
          restaurantIds.forEach(id => {
            defaultVisitsData[id] = { visited: false, visit_count: 0 };
          });
          setVisitsData(defaultVisitsData);
        }
      } catch (error) {
        console.error('Error fetching visits data:', error);
        // Set default visits data on error
        const defaultVisitsData: VisitsData = {};
        restaurants.forEach(restaurant => {
          defaultVisitsData[restaurant.id] = { visited: false, visit_count: 0 };
        });
        setVisitsData(defaultVisitsData);
      } finally {
        setLoadingVisits(false);
      }
    };

    fetchVisitsData();
  }, [user, restaurants, getAccessToken, signOut]);

  // Also fetch visits data when the page becomes visible again (user navigates back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user && restaurants.length > 0) {
        // Refetch visits data when page becomes visible again
        const refetchVisitsData = async () => {
          try {
            const token = await getAccessToken();
            if (!token) return;

            const restaurantIds = restaurants.map(r => r.id);
            const response = await fetch('/api/restaurants/visits', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({ restaurantIds }),
            });

            if (response.ok) {
              const data = await response.json();
              setVisitsData(data);
            } else if (response.status === 401) {
              // Retry once after a short delay
              console.warn('⚠️ Got 401 during visibility change, retrying...');
              await new Promise(resolve => setTimeout(resolve, 500)); // Shorter delay for visibility change

              const retryResponse = await fetch('/api/restaurants/visits', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ restaurantIds }),
              });

              if (retryResponse.ok) {
                const data = await retryResponse.json();
                setVisitsData(data);
              } else {
                console.error('❌ Authentication expired during visibility change after retry, signing out');
                await signOut();
              }
            }
          } catch (error) {
            console.error('Error refetching visits data:', error);
          }
        };

        refetchVisitsData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user, restaurants, getAccessToken, signOut]);

  // Function to update visits data when a card notifies a change
  const handleVisitsDataUpdate = useCallback((restaurantId: string, newVisitsData: { visited: boolean; visit_count: number }) => {
    setVisitsData(prev => ({
      ...prev,
      [restaurantId]: newVisitsData
    }));
  }, [user]);

  return { visitsData, loadingVisits, handleVisitsDataUpdate };
}
