'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';

export interface ScheduledMeal {
  id: string;
  restaurantId: string;
  organizerId: string;
  mealDate: string;
  mealTime: string;
  mealType: string;
  durationMinutes: number;
  googleCalendarLink: string;
  createdAt: string;
  restaurant: {
    id: string;
    name: string;
    location: string | null;
    description: string | null;
    image: string | null;
  } | null;
  organizer: {
    userId: string;
    displayName: string | null;
    avatarUrl: string | null;
    userIdCode: string | null;
  } | null;
  participants: Array<{
    id: string;
    userId: string;
    status: 'pending' | 'accepted' | 'declined';
    profile: {
      userId: string;
      displayName: string | null;
      avatarUrl: string | null;
      userIdCode: string | null;
    } | null;
  }>;
  isOrganizer: boolean;
  participantStatus: string | null;
}

export interface UserSearchResult {
  id: string;
  name: string | null;
  profileImage: string | null;
  userIdCode: string | null;
  location: string | null;
  bio: string | null;
  publicProfile: boolean;
  totalRestaurantsVisited: number;
  totalReviews: number;
  totalLists: number;
  createdAt: string;
}

interface UseScheduledMealsOptions {
  type?: 'all' | 'organized' | 'participating';
  enabled?: boolean;
}

export function useScheduledMeals(options: UseScheduledMealsOptions = {}) {
  const { type = 'all', enabled = true } = options;

  const [meals, setMeals] = useState<ScheduledMeal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  // Fetch scheduled meals
  const fetchMeals = useCallback(async (pageNum: number = 1) => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/meals/scheduled?type=${type}&page=${pageNum}&limit=20`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch meals');
      }

      const result = await response.json();
      
      if (pageNum === 1) {
        setMeals(result.data);
      } else {
        setMeals(prev => [...prev, ...result.data]);
      }
      
      setTotal(result.total);
      setHasMore(result.hasMore);
      setPage(pageNum);
    } catch (err) {
      console.error('Error fetching scheduled meals:', err);
      setError('Erro ao carregar refeições agendadas');
      toast.error('Erro ao carregar refeições agendadas');
    } finally {
      setLoading(false);
    }
  }, [type, enabled]);

  // Schedule a new meal
  const scheduleMeal = useCallback(async (data: {
    restaurantId: string;
    mealDate: string;
    mealTime: string;
    mealType: string;
    durationMinutes: number;
    participantUserIds?: string[];
  }) => {
    try {
      const response = await fetch('/api/meals/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to schedule meal');
      }

      toast.success('Refeição agendada com sucesso!');
      
      // Refresh meals list
      fetchMeals(1);
      
      return result.data;
    } catch (err: any) {
      console.error('Error scheduling meal:', err);
      toast.error(err.message || 'Erro ao agendar refeição');
      throw err;
    }
  }, [fetchMeals]);

  // Add participants to a meal
  const addParticipants = useCallback(async (mealId: string, userIds: string[]) => {
    try {
      const response = await fetch('/api/meals/participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mealId, userIds })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to add participants');
      }

      toast.success('Participantes adicionados com sucesso!');
      
      // Update local state
      setMeals(prev => prev.map(meal => {
        if (meal.id === mealId) {
          return {
            ...meal,
            participants: [...meal.participants, ...result.data]
          };
        }
        return meal;
      }));
      
      return result.data;
    } catch (err: any) {
      console.error('Error adding participants:', err);
      toast.error(err.message || 'Erro ao adicionar participantes');
      throw err;
    }
  }, []);

  // Update participant status
  const updateParticipantStatus = useCallback(async (mealId: string, status: 'accepted' | 'declined') => {
    try {
      const response = await fetch('/api/meals/participants', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mealId, status })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update status');
      }

      toast.success(status === 'accepted' ? 'Presença confirmada!' : 'Presença recusada');
      
      // Update local state
      setMeals(prev => prev.map(meal => {
        if (meal.id === mealId) {
          return {
            ...meal,
            participantStatus: status,
            participants: meal.participants.map(p => 
              p.userId === result.data.user_id 
                ? { ...p, status } 
                : p
            )
          };
        }
        return meal;
      }));
      
      return result.data;
    } catch (err: any) {
      console.error('Error updating participant status:', err);
      toast.error(err.message || 'Erro ao atualizar estado');
      throw err;
    }
  }, []);

  // Search users for adding participants
  const searchUsers = useCallback(async (query: string): Promise<UserSearchResult[]> => {
    if (!query.trim()) return [];

    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error('Failed to search users');
      }

      const result = await response.json();
      return result.data || [];
    } catch (err) {
      console.error('Error searching users:', err);
      return [];
    }
  }, []);

  // Download ICS file for a meal
  const downloadIcs = useCallback((mealId: string) => {
    window.open(`/api/meals/${mealId}/ics`, '_blank');
  }, []);

  // Load more meals
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchMeals(page + 1);
    }
  }, [loading, hasMore, page, fetchMeals]);

  // Initial load
  useEffect(() => {
    if (enabled) {
      fetchMeals(1);
    }
  }, [enabled, fetchMeals]);

  return {
    meals,
    loading,
    error,
    hasMore,
    total,
    page,
    fetchMeals,
    scheduleMeal,
    addParticipants,
    updateParticipantStatus,
    searchUsers,
    downloadIcs,
    loadMore
  };
}

export default useScheduledMeals;