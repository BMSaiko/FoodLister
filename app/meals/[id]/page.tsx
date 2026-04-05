'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Clock, Users, Utensils, Download, ArrowLeft, Loader2, Check, X, ExternalLink } from 'lucide-react';
import Navbar from '@/components/ui/navigation/Navbar';
import { useAuth } from '@/hooks/auth/useAuth';
import { toast } from 'react-toastify';

interface Meal {
  id: string;
  restaurantId: string;
  organizerId: string;
  mealDate: string;
  mealTime: string;
  mealType: string;
  durationMinutes: number;
  googleCalendarLink: string | null;
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

const mealTypeLabels: Record<string, string> = {
  'pequeno-almoco': 'Pequeno Almoço',
  'almoco': 'Almoço',
  'brunch': 'Brunch',
  'lanche': 'Lanche',
  'jantar': 'Jantar',
  'ceia': 'Ceia'
};

export default function MealDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const mealId = params.id as string;

  const [meal, setMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchMeal();
  }, [mealId]);

  const fetchMeal = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/meals/scheduled`);
      if (response.ok) {
        const result = await response.json();
        const foundMeal = result.data?.find((m: Meal) => m.id === mealId);
        if (foundMeal) {
          setMeal(foundMeal);
        } else {
          // Try fetching directly from meal API
          const mealResponse = await fetch(`/api/meals/${mealId}`);
          if (mealResponse.ok) {
            const mealData = await mealResponse.json();
            setMeal(mealData.data);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching meal:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!meal) return;
    setUpdating(true);
    try {
      const response = await fetch('/api/meals/participants', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mealId, status: 'accepted' })
      });

      if (response.ok) {
        setMeal(prev => prev ? {
          ...prev,
          participantStatus: 'accepted',
          participants: prev.participants.map(p =>
            p.userId === user?.id ? { ...p, status: 'accepted' } : p
          )
        } : null);
        toast.success('Presença confirmada!');
      } else {
        toast.error('Erro ao confirmar presença');
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast.error('Erro ao confirmar presença');
    } finally {
      setUpdating(false);
    }
  };

  const handleDecline = async () => {
    if (!meal) return;
    setUpdating(true);
    try {
      const response = await fetch('/api/meals/participants', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mealId, status: 'declined' })
      });

      if (response.ok) {
        setMeal(prev => prev ? {
          ...prev,
          participantStatus: 'declined',
          participants: prev.participants.map(p =>
            p.userId === user?.id ? { ...p, status: 'declined' } : p
          )
        } : null);
        toast.success('Presença recusada');
      } else {
        toast.error('Erro ao recusar presença');
      }
    } catch (error) {
      console.error('Error declining invitation:', error);
      toast.error('Erro ao recusar presença');
    } finally {
      setUpdating(false);
    }
  };

  const handleDownloadIcs = () => {
    window.open(`/api/meals/${mealId}/ics`, '_blank');
  };

  const handleGoogleCalendar = () => {
    if (meal?.googleCalendarLink) {
      window.open(meal.googleCalendarLink, '_blank');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Aceite</span>;
      case 'declined':
        return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">Recusado</span>;
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">Pendente</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
            <span className="ml-3 text-gray-600">A carregar detalhes da refeição...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!meal) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <Utensils className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Refeição não encontrada</h2>
            <p className="text-gray-500 mb-6">A refeição que procuras não existe ou foi removida.</p>
            <Link
              href="/users/me"
              className="inline-flex items-center px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao perfil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-amber-600 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </button>

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-amber-100 rounded-xl">
                  <Utensils className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {meal.restaurant?.name || 'Restaurante'}
                  </h1>
                  <p className="text-amber-700 font-medium">
                    {mealTypeLabels[meal.mealType] || meal.mealType}
                  </p>
                </div>
              </div>
              {meal.isOrganizer && (
                <span className="px-3 py-1 bg-amber-200 text-amber-800 text-sm font-medium rounded-full">
                  Organizador
                </span>
              )}
              {meal.participantStatus && getStatusBadge(meal.participantStatus)}
            </div>
          </div>

          {/* Details */}
          <div className="px-6 py-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 text-gray-700">
                <Calendar className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-sm text-gray-500">Data</p>
                  <p className="font-medium">{formatDate(meal.mealDate)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-gray-700">
                <Clock className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-sm text-gray-500">Hora</p>
                  <p className="font-medium">{meal.mealTime}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-gray-700">
                <Clock className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-sm text-gray-500">Duração</p>
                  <p className="font-medium">{meal.durationMinutes} minutos</p>
                </div>
              </div>
              {meal.restaurant?.location && (
                <div className="flex items-center space-x-3 text-gray-700">
                  <svg className="h-5 w-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-500">Localização</p>
                    <p className="font-medium">{meal.restaurant.location}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Organizer */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Organizador</h2>
          <div className="flex items-center space-x-3">
            {meal.organizer?.avatarUrl ? (
              <img
                src={meal.organizer.avatarUrl}
                alt=""
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-amber-200 flex items-center justify-center text-sm font-medium text-amber-700">
                {meal.organizer?.displayName?.charAt(0) || '?'}
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900">
                {meal.organizer?.displayName || 'Utilizador'}
              </p>
              {meal.organizer?.userIdCode && (
                <p className="text-sm text-gray-500">{meal.organizer.userIdCode}</p>
              )}
            </div>
          </div>
        </div>

        {/* Participants */}
        {meal.participants.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <Users className="h-5 w-5 text-amber-500" />
              <h2 className="text-lg font-semibold text-gray-900">
                Participantes ({meal.participants.length})
              </h2>
            </div>
            <div className="space-y-3">
              {meal.participants.map(participant => (
                <div key={participant.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-3">
                    {participant.profile?.avatarUrl ? (
                      <img
                        src={participant.profile.avatarUrl}
                        alt=""
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                        {participant.profile?.displayName?.charAt(0) || '?'}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {participant.profile?.displayName || 'Utilizador'}
                      </p>
                      {participant.profile?.userIdCode && (
                        <p className="text-xs text-gray-500">{participant.profile.userIdCode}</p>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(participant.status)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Ações</h2>
          <div className="space-y-3">
            {/* Download ICS */}
            <button
              onClick={handleDownloadIcs}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"
            >
              <Download className="h-5 w-5" />
              <span>Download .ics (Calendário)</span>
            </button>

            {/* Google Calendar */}
            {meal.googleCalendarLink && (
              <button
                onClick={handleGoogleCalendar}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-white border-2 border-amber-500 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors font-medium"
              >
                <ExternalLink className="h-5 w-5" />
                <span>Adicionar ao Google Calendar</span>
              </button>
            )}

            {/* Accept/Decline for participants */}
            {!meal.isOrganizer && meal.participantStatus === 'pending' && (
              <div className="flex space-x-3 pt-2">
                <button
                  onClick={handleAccept}
                  disabled={updating}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors font-medium"
                >
                  <Check className="h-5 w-5" />
                  <span>{updating ? 'A confirmar...' : 'Confirmar Presença'}</span>
                </button>
                <button
                  onClick={handleDecline}
                  disabled={updating}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors font-medium"
                >
                  <X className="h-5 w-5" />
                  <span>{updating ? 'A recusar...' : 'Recusar'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* View Restaurant Link */}
        {meal.restaurant?.id && (
          <div className="text-center">
            <Link
              href={`/restaurants/${meal.restaurant.id}`}
              className="text-amber-600 hover:text-amber-700 font-medium"
            >
              Ver página do restaurante →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}