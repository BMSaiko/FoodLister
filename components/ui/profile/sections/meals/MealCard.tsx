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

  const getStatusBadge = () => {
    if (!meal.participantStatus || meal.isOrganizer) return null;

    const statusConfig = {
      pending: { label: 'Pendente', className: 'bg-amber-100 text-amber-800' },
      accepted: { label: 'Aceite', className: 'bg-green-100 text-green-800' },
      declined: { label: 'Recusado', className: 'bg-red-100 text-red-800' }
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{mealIcon}</span>
            <div>
              <h3 className="font-semibold text-gray-900">{mealLabel}</h3>
              <p className="text-sm text-amber-700">{meal.restaurant?.name || 'Restaurante'}</p>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-3 space-y-3">
        {/* Date and Time */}
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-amber-500" />
            <span className="capitalize">{formatDatePT(meal.mealDate)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-amber-500" />
            <span>{formatTimePT(meal.mealTime)}</span>
            <span className="text-gray-400">({meal.durationMinutes} min)</span>
          </div>
        </div>

        {/* Location */}
        {meal.restaurant?.location && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4 text-amber-500" />
            <span>{meal.restaurant.location}</span>
          </div>
        )}

        {/* Organizer */}
        {!meal.isOrganizer && meal.organizer && (
          <div className="text-sm text-gray-600">
            Organizado por <span className="font-medium text-gray-900">{meal.organizer.displayName || 'Utilizador'}</span>
          </div>
        )}

        {/* Participants */}
        {meal.participants.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Users className="h-4 w-4 text-amber-500" />
              <span>{meal.participants.length} participante(s)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {meal.participants.slice(0, 5).map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center space-x-2 bg-gray-50 rounded-full px-3 py-1"
                >
                  {participant.profile?.avatarUrl ? (
                    <img
                      src={participant.profile.avatarUrl}
                      alt=""
                      className="h-5 w-5 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-5 w-5 rounded-full bg-amber-200 flex items-center justify-center text-xs font-medium text-amber-700">
                      {participant.profile?.displayName?.charAt(0) || '?'}
                    </div>
                  )}
                  <span className="text-xs text-gray-700 truncate max-w-[100px]">
                    {participant.profile?.displayName || 'Utilizador'}
                  </span>
                  <div
                    className={`h-2 w-2 rounded-full ${
                      participant.status === 'accepted'
                        ? 'bg-green-500'
                        : participant.status === 'declined'
                        ? 'bg-red-500'
                        : 'bg-amber-500'
                    }`}
                  />
                </div>
              ))}
              {meal.participants.length > 5 && (
                <span className="text-xs text-gray-500 self-center">
                  +{meal.participants.length - 5} mais
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            {/* View Details */}
            <Link
              href={`/meals/${meal.id}`}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
              title="Ver detalhes"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Detalhes</span>
            </Link>

            {/* Download ICS */}
            {onDownloadIcs && (
              <button
                onClick={() => onDownloadIcs(meal.id)}
                className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title="Descarregar .ics"
              >
                <Download className="h-4 w-4" />
                <span>.ics</span>
              </button>
            )}
          </div>

          {/* Accept/Decline for participants */}
          {!meal.isOrganizer && meal.participantStatus && (
            <div className="flex items-center space-x-2">
              {onAccept && (
                <button
                  onClick={() => onAccept(meal.id)}
                  className={`flex items-center space-x-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    meal.participantStatus === 'accepted'
                      ? 'text-white bg-green-600 hover:bg-green-700 ring-2 ring-green-300'
                      : 'text-white bg-green-500 hover:bg-green-600'
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
                      ? 'text-white bg-red-600 hover:bg-red-700 ring-2 ring-red-300'
                      : 'text-white bg-red-500 hover:bg-red-600'
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