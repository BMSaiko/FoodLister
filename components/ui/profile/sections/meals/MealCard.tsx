'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Clock, MapPin, Download, ExternalLink, Check, X, Users } from 'lucide-react';

interface MealCardProps {
  meal: {
    id: string;
    mealDate: string;
    mealTime: string;
    mealType: string;
    durationMinutes: number;
    isOrganizer: boolean;
    participantStatus: string | null;
    restaurant: {
      name: string;
      location: string | null;
      image: string | null;
    } | null;
    organizer: {
      displayName: string | null;
      avatarUrl: string | null;
    } | null;
    participants: Array<{
      id: string;
      userId: string;
      status: string;
      profile: {
        displayName: string | null;
        avatarUrl: string | null;
      } | null;
    }>;
  };
  onAccept?: (mealId: string) => void;
  onDecline?: (mealId: string) => void;
  onDownloadIcs?: (mealId: string) => void;
  onOpenGoogleCalendar?: (link: string) => void;
  onViewDetails?: (mealId: string) => void;
}

const MEAL_ICONS: Record<string, string> = {
  'pequeno-almoco': '☕',
  'almoco': '🍽️',
  'brunch': '🥐',
  'lanche': '🍪',
  'jantar': '🍽️',
  'ceia': '🌙'
};

const MEAL_LABELS: Record<string, string> = {
  'pequeno-almoco': 'Pequeno Almoço',
  'almoco': 'Almoço',
  'brunch': 'Brunch',
  'lanche': 'Lanche',
  'jantar': 'Jantar',
  'ceia': 'Ceia'
};

function formatDatePT(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('pt-PT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

function formatTimePT(timeStr: string): string {
  return timeStr;
}

export default function MealCard({
  meal,
  onAccept,
  onDecline,
  onDownloadIcs,
  onOpenGoogleCalendar,
  onViewDetails
}: MealCardProps) {
  const mealIcon = MEAL_ICONS[meal.mealType] || '🍴';
  const mealLabel = MEAL_LABELS[meal.mealType] || meal.mealType;

  // Check if meal date/time has passed
  const isMealPast = () => {
    const mealDateTime = new Date(`${meal.mealDate}T${meal.mealTime}`);
    return mealDateTime < new Date();
  };

  // Determine if user can accept/decline (organizer or participant)
  const canRespond = meal.isOrganizer || meal.participantStatus !== null && meal.participantStatus !== undefined;

  const getStatusBadge = () => {
    if (!meal.participantStatus || meal.isOrganizer) return null;

    const statusConfig = {
      pending: { label: 'Pendente', className: 'bg-[var(--amber-100)] text-[var(--amber-800)]' },
      accepted: { label: 'Aceite', className: 'bg-[var(--green-100)] text-[var(--green-800)]' },
      declined: { label: 'Recusado', className: 'bg-[var(--red-100)] text-[var(--red-800)]' }
    };

    const config = statusConfig[meal.participantStatus as keyof typeof statusConfig];
    if (!config) return null;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="bg-[var(--card-bg)] rounded-xl shadow-sm border border-[var(--gray-100)] overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="bg-gradient-to-r from-[var(--amber-50)] to-[var(--orange-50)] px-4 py-3 border-b border-[var(--gray-100)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{mealIcon}</span>
            <div>
              <h3 className="font-semibold text-[var(--gray-900)]">{mealLabel}</h3>
              <p className="text-sm text-[var(--amber-700)]">{meal.restaurant?.name || 'Restaurante'}</p>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-3 space-y-3">
        {/* Date and Time */}
        <div className="flex items-center space-x-4 text-sm text-[var(--gray-400)]">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-[var(--amber-500)]" />
            <span className="capitalize">{formatDatePT(meal.mealDate)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-[var(--amber-500)]" />
            <span>{formatTimePT(meal.mealTime)}</span>
            <span className="text-[var(--gray-400)]">({meal.durationMinutes} min)</span>
          </div>
        </div>

        {/* Location */}
        {meal.restaurant?.location && (
          <div className="flex items-center space-x-2 text-sm text-[var(--gray-400)]">
            <MapPin className="h-4 w-4 text-[var(--amber-500)]" />
            <span>{meal.restaurant.location}</span>
          </div>
        )}

        {/* Organizer */}
        {!meal.isOrganizer && meal.organizer && (
          <div className="text-sm text-[var(--gray-400)]">
            Organizado por <span className="font-medium text-[var(--gray-900)]">{meal.organizer.displayName || 'Utilizador'}</span>
          </div>
        )}

        {/* Participants */}
        {meal.participants.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-[var(--gray-400)]">
              <Users className="h-4 w-4 text-[var(--amber-500)]" />
              <span>{meal.participants.length} participante(s)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {meal.participants.slice(0, 5).map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center space-x-2 bg-[var(--background-secondary)] rounded-full px-3 py-1"
                >
                  {participant.profile?.avatarUrl ? (
                    <img
                      src={participant.profile.avatarUrl}
                      alt=""
                      className="h-5 w-5 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-5 w-5 rounded-full bg-[var(--amber-200)] flex items-center justify-center text-xs font-medium text-[var(--amber-700)]">
                      {participant.profile?.displayName?.charAt(0) || '?'}
                    </div>
                  )}
                  <span className="text-xs text-[var(--gray-300)] truncate max-w-[100px]">
                    {participant.profile?.displayName || 'Utilizador'}
                  </span>
                  <div
                    className={`h-2 w-2 rounded-full ${
                      participant.status === 'accepted'
                        ? 'bg-[var(--green-500)]'
                        : participant.status === 'declined'
                        ? 'bg-[var(--red-500)]'
                        : 'bg-[var(--amber-500)]'
                    }`}
                  />
                </div>
              ))}
              {meal.participants.length > 5 && (
                <span className="text-xs text-[var(--gray-500)] self-center">
                  +{meal.participants.length - 5} mais
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-[var(--gray-200)]">
          <div className="flex items-center space-x-2">
            {/* View Details */}
            <Link
              href={`/meals/${meal.id}`}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm text-[var(--amber-700)] bg-[var(--amber-50)] hover:bg-[var(--amber-100)] rounded-lg transition-colors"
              title="Ver detalhes"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Detalhes</span>
            </Link>

            {/* Download ICS */}
            {onDownloadIcs && (
              <button
                onClick={() => onDownloadIcs(meal.id)}
                className="flex items-center space-x-1 px-3 py-1.5 text-sm text-[var(--gray-300)] bg-[var(--background-secondary)] hover:bg-[var(--background-tertiary)] rounded-lg transition-colors"
                title="Descarregar .ics"
              >
                <Download className="h-4 w-4" />
                <span>.ics</span>
              </button>
            )}
          </div>

          {/* Accept/Decline for organizer and participants */}
          {!isMealPast() && canRespond && (
            <div className="flex items-center space-x-2">
              {onAccept && (
                <button
                  onClick={() => onAccept(meal.id)}
                  className={`flex items-center space-x-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    meal.participantStatus === 'accepted'
                      ? 'text-white bg-[var(--green-600)] hover:bg-[var(--green-700)] ring-2 ring-[var(--green-300)]'
                      : 'text-white bg-[var(--green-500)] hover:bg-[var(--green-600)]'
                  }`}
                >
                  <Check className="h-4 w-4" />
                  <span>{meal.participantStatus === 'accepted' ? 'Aceite ✓' : 'Aceitar'}</span>
                </button>
              )}
              {onDecline && (
                <button
                  onClick={() => onDecline(meal.id)}
                  className={`flex items-center space-x-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    meal.participantStatus === 'declined'
                      ? 'text-white bg-[var(--red-600)] hover:bg-[var(--red-700)] ring-2 ring-[var(--red-300)]'
                      : 'text-white bg-[var(--red-500)] hover:bg-[var(--red-600)]'
                  }`}
                >
                  <X className="h-4 w-4" />
                  <span>{meal.participantStatus === 'declined' ? 'Recusado ✓' : 'Recusar'}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}