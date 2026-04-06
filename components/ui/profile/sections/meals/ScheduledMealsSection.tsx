'use client';

import React, { useState, useMemo } from 'react';
import { Calendar, Utensils, Loader2, SearchX } from 'lucide-react';
import { useScheduledMeals } from '@/hooks/data/useScheduledMeals';
import { useAuth } from '@/hooks/auth/useAuth';
import MealCard from './MealCard';
import MealSearchBar, { MealFilters } from './MealSearchBar';

interface ScheduledMealsSectionProps {
  userId?: string;
  type?: 'all' | 'organized' | 'participating';
}

export default function ScheduledMealsSection({
  userId,
  type = 'all'
}: ScheduledMealsSectionProps) {
  const { user } = useAuth();
  const isCurrentUser = !userId || userId === user?.id;

  // If viewing another user's profile, show organized and participating meals
  const mealType = isCurrentUser ? type : 'all';

  // Search state
  const [searchFilters, setSearchFilters] = useState<MealFilters>({
    searchQuery: '',
    dateFrom: '',
    dateTo: '',
    mealType: ''
  });

  const {
    meals,
    loading,
    hasMore,
    total,
    loadMore,
    updateParticipantStatus,
    downloadIcs
  } = useScheduledMeals({
    type: mealType,
    enabled: true,
    userId: isCurrentUser ? undefined : userId,
    searchQuery: searchFilters.searchQuery,
    dateFrom: searchFilters.dateFrom,
    dateTo: searchFilters.dateTo,
    mealType: searchFilters.mealType
  });

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    return [
      searchFilters.searchQuery,
      searchFilters.dateFrom,
      searchFilters.dateTo,
      searchFilters.mealType
    ].filter(Boolean).length;
  }, [searchFilters]);

  const handleSearch = (filters: MealFilters) => {
    setSearchFilters(filters);
  };

  const handleClear = () => {
    setSearchFilters({
      searchQuery: '',
      dateFrom: '',
      dateTo: '',
      mealType: ''
    });
  };

  const handleAccept = async (mealId: string) => {
    await updateParticipantStatus(mealId, 'accepted');
  };

  const handleDecline = async (mealId: string) => {
    await updateParticipantStatus(mealId, 'declined');
  };

  const handleDownloadIcs = (mealId: string) => {
    downloadIcs(mealId);
  };

  const handleOpenGoogleCalendar = (link: string) => {
    window.open(link, '_blank');
  };

  const hasActiveSearch = activeFiltersCount > 0;

  if (loading && meals.length === 0) {
    return (
      <div className="space-y-4">
        {/* Search Bar */}
        <MealSearchBar
          onSearch={handleSearch}
          onClear={handleClear}
          activeFiltersCount={activeFiltersCount}
        />
        
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-amber-500 animate-spin mb-3" />
          <p className="text-gray-500 text-sm">A carregar refeições agendadas...</p>
        </div>
      </div>
    );
  }

  if (meals.length === 0) {
    return (
      <div className="space-y-4">
        {/* Search Bar */}
        <MealSearchBar
          onSearch={handleSearch}
          onClear={handleClear}
          activeFiltersCount={activeFiltersCount}
        />
        
        <div className="flex flex-col items-center justify-center py-12 text-center">
          {hasActiveSearch ? (
            <>
              <div className="p-4 bg-gray-50 rounded-full mb-4">
                <SearchX className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhuma refeição encontrada
              </h3>
              <p className="text-gray-500 text-sm max-w-sm">
                Não foram encontradas refeições com os filtros selecionados. Tenta ajustar a tua pesquisa.
              </p>
            </>
          ) : (
            <>
              <div className="p-4 bg-amber-50 rounded-full mb-4">
                <Calendar className="h-8 w-8 text-amber-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Sem refeições agendadas
              </h3>
              <p className="text-gray-500 text-sm max-w-sm">
                {isCurrentUser
                  ? 'Ainda não tens refeições agendadas. Agenda a tua próxima refeição num restaurante!'
                  : 'Este utilizador ainda não tem refeições agendadas.'}
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <MealSearchBar
        onSearch={handleSearch}
        onClear={handleClear}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Utensils className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-semibold text-gray-900">
            Refeições Agendadas
          </h2>
        </div>
        <span className="text-sm text-gray-500">{total} refeição(ões)</span>
      </div>

      {/* Meals List */}
      <div className="space-y-4">
        {meals.map((meal) => (
          <MealCard
            key={meal.id}
            meal={{
              id: meal.id,
              mealDate: meal.mealDate,
              mealTime: meal.mealTime,
              mealType: meal.mealType,
              durationMinutes: meal.durationMinutes,
              isOrganizer: meal.isOrganizer,
              participantStatus: meal.participantStatus,
              restaurant: meal.restaurant,
              organizer: meal.organizer,
              participants: meal.participants,
              googleCalendarLink: meal.googleCalendarLink
            } as any}
            onAccept={handleAccept}
            onDecline={handleDecline}
            onDownloadIcs={handleDownloadIcs}
            onOpenGoogleCalendar={handleOpenGoogleCalendar}
          />
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-6 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
          >
            {loading ? (
              <span className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>A carregar...</span>
              </span>
            ) : (
              'Carregar mais'
            )}
          </button>
        </div>
      )}
    </div>
  );
}