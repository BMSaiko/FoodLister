'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePageTitle } from '@/hooks/usePageTitle';
import Link from 'next/link';
import Navbar from '@/components/ui/navigation/Navbar';
import { useAuthUser } from '@/hooks/auth/useAuthUser';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import { toast } from 'react-toastify';
import { useLanguage } from "@/contexts";
import Modal from '@/components/ui/Modal';
import ToviLoader from "@/components/loading/ToviLoader";
import Icon from '@/components/ui/icons/Icon';
import type { IconName } from '@/components/ui/icons/names';

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
    slug?: string | null;
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
  const { t } = useLanguage();
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthUser();
  const mealId = params.id as string;

  const [meal, setMeal] = useState<Meal | null>(null);
  usePageTitle(meal?.restaurant?.name ? `${meal.restaurant.name} - FoodLister` : t("FoodLister - Refeição"));
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editForm, setEditForm] = useState({ mealDate: '', mealTime: '', mealType: '', durationMinutes: 0 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMeal();
  }, [mealId]);

  const fetchMeal = async () => {
    setLoading(true);
    try {
      // Fetch specific meal directly instead of ALL scheduled meals
      const mealResponse = await fetch(`/api/meals/${mealId}`);
      if (mealResponse.ok) {
        const mealData = await mealResponse.json();
        setMeal(mealData.data || mealData.meal);
      } else {
        // Fallback: fetch from scheduled and find
        const response = await fetch(`/api/meals/scheduled`);
        if (response.ok) {
          const result = await response.json();
          const foundMeal = result.data?.find((m: Meal) => m.id === mealId);
          if (foundMeal) {
            setMeal(foundMeal);
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
        toast.success(t('Presença confirmada!'));
      } else {
        toast.error(t('Erro ao confirmar presença'));
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast.error(t('Erro ao confirmar presença'));
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
        toast.success(t('Presença recusada'));
      } else {
        toast.error(t('Erro ao recusar presença'));
      }
    } catch (error) {
      console.error('Error declining invitation:', error);
      toast.error(t('Erro ao recusar presença'));
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

  const handleEdit = () => {
    if (!meal) return;
    setEditForm({
      mealDate: meal.mealDate,
      mealTime: meal.mealTime,
      mealType: meal.mealType,
      durationMinutes: meal.durationMinutes
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!meal) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/meals/${mealId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        const result = await response.json();
        setMeal(prev => prev ? {
          ...prev,
          mealDate: result.data.meal_date,
          mealTime: result.data.meal_time,
          mealType: result.data.meal_type,
          durationMinutes: result.data.duration_minutes
        } : null);
        setShowEditModal(false);
        toast.success(t('Refeição atualizada com sucesso!'));
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || t('Erro ao atualizar refeição'));
      }
    } catch (error) {
      console.error('Error updating meal:', error);
      toast.error(t('Erro ao atualizar refeição'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!meal) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/meals/${mealId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success(t('Refeição eliminada com sucesso!'));
        router.push('/users/me');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || t('Erro ao eliminar refeição'));
      }
    } catch (error) {
      console.error('Error deleting meal:', error);
      toast.error(t('Erro ao eliminar refeição'));
    } finally {
      setSaving(false);
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
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">{t("Aceite")}</span>;
      case 'declined':
        return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">{t("Recusado")}</span>;
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">{t("Pendente")}</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <ErrorBoundary pageName="MealDetails">
        <div className="min-h-[100dvh] bg-[var(--background)]">
          <Navbar />
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center py-20">
              <ToviLoader size="sm" />
              <span className="ml-3 text-white/50">{t("A carregar detalhes da refeição...")}</span>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  if (!meal) {
    return (
      <ErrorBoundary pageName="MealDetails">
        <div className="min-h-[100dvh] bg-[var(--background)]">
          <Navbar />
          <div className="container mx-auto px-4 py-8">
            <div className="text-center py-20">
              <Icon name="restaurantes" className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white/90 mb-2">{t("Refeição não encontrada")}</h2>
              <p className="text-gray-500 mb-6">{t("A refeição que procuras não existe ou foi removida.")}</p>
              <Link
                href="/users/me"
                className="inline-flex items-center px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"
              >
                <Icon name="seta-esq" className="h-4 w-4 mr-2" />
                {t("Voltar ao perfil")}
              </Link>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  const mealDateTime = new Date(`${meal.mealDate}T${meal.mealTime}`);
  const isMealPast = mealDateTime < new Date();
  const canRespond = !isMealPast && (meal.isOrganizer || (meal.participantStatus !== null && meal.participantStatus !== undefined));
  const timeLabel = (() => {
    const start = (meal.mealTime || '').slice(0, 5);
    if (!start || !meal.durationMinutes) return start;
    const [h, m] = start.split(':').map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return start;
    const end = (h * 60 + m + meal.durationMinutes) % 1440;
    return `${start} – ${String(Math.floor(end / 60)).padStart(2, '0')}:${String(end % 60).padStart(2, '0')}`;
  })();

  const rsvp = canRespond ? (
    <div className="grid grid-cols-1 gap-2.5">
      <button
        onClick={handleAccept}
        disabled={updating}
        className={`flex min-h-[44px] items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-3 font-semibold text-white transition-colors disabled:opacity-50 ${
          meal.participantStatus === 'accepted'
            ? 'bg-green-600 ring-2 ring-green-400 ring-offset-2 ring-offset-[var(--background)] hover:bg-green-700'
            : 'bg-green-600 hover:bg-green-700'
        }`}
      >
        <Icon name="visto" className="h-5 w-5 !text-white" />
        <span>{updating ? t('A confirmar...') : meal.participantStatus === 'accepted' ? t('Aceite ✓') : t('Confirmar Presença')}</span>
      </button>
      <button
        onClick={handleDecline}
        disabled={updating}
        className={`flex min-h-[44px] items-center justify-center gap-2 whitespace-nowrap rounded-xl border px-4 py-3 font-semibold transition-colors disabled:opacity-50 ${
          meal.participantStatus === 'declined'
            ? 'border-red-400 bg-red-500/15 text-red-300 ring-2 ring-red-400 ring-offset-2 ring-offset-[var(--background)]'
            : 'border-red-400/40 text-red-400 hover:bg-red-500/10'
        }`}
      >
        <Icon name="fechar" className="h-5 w-5 !text-current" />
        <span>{updating ? t('A recusar...') : meal.participantStatus === 'declined' ? t('Recusado ✓') : t('Recusar')}</span>
      </button>
    </div>
  ) : null;

  const facts: Array<{ icon: IconName; label: string; value: string }> = [
    { icon: 'calendario', label: t('Data'), value: formatDate(meal.mealDate) },
    { icon: 'horario', label: t('Hora'), value: timeLabel },
    { icon: 'horario', label: t('Duração'), value: t('{n} minutos', { n: meal.durationMinutes }) },
  ];
  if (meal.restaurant?.location) {
    facts.push({ icon: 'pin', label: t('Localização'), value: meal.restaurant.location });
  }

  return (
    <ErrorBoundary pageName="MealDetails">
    <div className="min-h-[100dvh] bg-[var(--background)]">
      <Navbar />
      <main className={`container mx-auto max-w-5xl px-4 py-8 ${canRespond ? 'pb-32 lg:pb-8' : ''}`}>
        <button
          onClick={() => router.back()}
          className="mb-4 flex min-h-[44px] items-center text-white/50 transition-colors hover:text-amber-500"
        >
          <Icon name="seta-esq" className="mr-2 h-4 w-4" />
          {t("Voltar")}
        </button>

        {/* Cabeçalho */}
        <header className="mb-6 flex items-center gap-4">
          <div className="relative flex h-16 w-16 flex-none items-center justify-center overflow-hidden rounded-2xl bg-amber-500/15 text-amber-500 sm:h-20 sm:w-20">
            <Icon name="restaurantes" className="absolute h-7 w-7" />
            {meal.restaurant?.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={meal.restaurant.image}
                alt=""
                className="relative z-10 h-full w-full object-cover"
                onError={(e) => e.currentTarget.remove()}
              />
            )}
          </div>
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-amber-400">
                {t(mealTypeLabels[meal.mealType] || meal.mealType)}
              </span>
              {meal.isOrganizer && (
                <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-amber-400">
                  {t("Organizador")}
                </span>
              )}
              {meal.participantStatus && getStatusBadge(meal.participantStatus)}
            </div>
            <h1 className="break-words text-2xl font-bold text-white/90 sm:text-3xl">
              {meal.restaurant?.name || t('Restaurante')}
            </h1>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
          <div className="space-y-4">
            <section className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-5">
              {facts.map((f, i) => (
                <div key={f.label} className={`flex items-start gap-3 py-3 ${i > 0 ? 'border-t border-white/[0.06]' : ''}`}>
                  <Icon name={f.icon} className="mt-1 h-5 w-5 flex-none text-amber-500" />
                  <div className="min-w-0">
                    <p className="text-xs text-white/40">{f.label}</p>
                    <p className="break-words font-medium text-white/90 first-letter:uppercase">{f.value}</p>
                  </div>
                </div>
              ))}
            </section>

            <section className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">{t("Organizador")}</h2>
              <div className="flex items-center gap-3">
                {meal.organizer?.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={meal.organizer.avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-amber-500/15 text-sm font-semibold text-amber-400">
                    {meal.organizer?.displayName?.charAt(0) || '?'}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate font-medium text-white/90">{meal.organizer?.displayName || t('Utilizador')}</p>
                  {meal.organizer?.userIdCode && <p className="text-xs text-white/40">{meal.organizer.userIdCode}</p>}
                </div>
              </div>
            </section>

            {meal.participants.length > 0 && (
              <section className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
                <h2 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/40">
                  <Icon name="utilizadores" className="h-4 w-4 text-amber-500" />
                  {t("Participantes ({n})", { n: meal.participants.length })}
                </h2>
                <ul>
                  {meal.participants.map((participant, i) => (
                    <li key={participant.id} className={`flex items-center gap-3 py-2.5 ${i > 0 ? 'border-t border-white/[0.06]' : ''}`}>
                      {participant.profile?.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={participant.profile.avatarUrl} alt="" className="h-9 w-9 flex-none rounded-full object-cover" />
                      ) : (
                        <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-white/[0.07] text-sm font-medium text-white/50">
                          {participant.profile?.displayName?.charAt(0) || '?'}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white/90">{participant.profile?.displayName || t('Utilizador')}</p>
                        {participant.profile?.userIdCode && <p className="text-xs text-white/40">{participant.profile.userIdCode}</p>}
                      </div>
                      {getStatusBadge(participant.status)}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {meal.restaurant?.id && (
              <Link
                href={`/restaurants/${meal.restaurant.slug || meal.restaurant.id}`}
                className="inline-flex min-h-[44px] items-center font-semibold text-amber-500 hover:text-amber-400"
              >
                {t("Ver página do restaurante →")}
              </Link>
            )}
          </div>

          {/* Painel de ações */}
          <aside className="lg:sticky lg:top-24">
            <div className="grid gap-2.5 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40">{t("Ações")}</h2>
              {rsvp && <div className="hidden lg:block">{rsvp}</div>}
              <button
                onClick={handleDownloadIcs}
                className="flex min-h-[44px] items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-white/10 px-4 py-3 font-semibold text-white/90 transition-colors hover:border-amber-500/50 hover:bg-amber-500/10"
              >
                <Icon name="descarregar" className="h-5 w-5" />
                <span>{t("Download .ics (Calendário)")}</span>
              </button>
              {meal.googleCalendarLink && (
                <button
                  onClick={handleGoogleCalendar}
                  className="flex min-h-[44px] items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-white/10 px-4 py-3 font-semibold text-white/90 transition-colors hover:border-amber-500/50 hover:bg-amber-500/10"
                >
                  <Icon name="externo" className="h-5 w-5" />
                  <span>{t("Adicionar ao Google Calendar")}</span>
                </button>
              )}
              {meal.isOrganizer && (
                <>
                  <hr className="border-white/[0.06]" />
                  <button
                    onClick={handleEdit}
                    className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 font-semibold text-white/90 transition-colors hover:border-amber-500/50 hover:bg-amber-500/10"
                  >
                    <Icon name="editar" className="h-4 w-4" />
                    <span>{t("Editar refeição")}</span>
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 font-semibold text-red-400 transition-colors hover:border-red-400/50 hover:bg-red-500/10"
                  >
                    <Icon name="apagar" className="h-4 w-4" />
                    <span>{t("Eliminar refeição")}</span>
                  </button>
                </>
              )}
            </div>
          </aside>
        </div>
      </main>

      {/* RSVP fixo no telemóvel */}
      {rsvp && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.06] bg-[#050505]/95 px-4 pt-3 backdrop-blur lg:hidden" style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}>
          <div className="mx-auto max-w-5xl [&>div]:grid-cols-2">{rsvp}</div>
        </div>
      )}

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} size="lg" ariaLabel={t("Editar Refeição")}>
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 px-6 py-4 rounded-t-xl border-b border-white/[0.06]">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white/90">{t("Editar Refeição")}</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-white/50"
                >
                  <Icon name="fechar" className="h-5 w-5 !text-current" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-white/70 font-semibold mb-2 text-sm">{t("Data")}</label>
                <input
                  type="date"
                  value={editForm.mealDate}
                  onChange={(e) => setEditForm(prev => ({ ...prev, mealDate: e.target.value }))}
                  className="w-full px-4 py-3 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-white/70 font-semibold mb-2 text-sm">{t("Hora")}</label>
                <input
                  type="time"
                  value={editForm.mealTime}
                  onChange={(e) => setEditForm(prev => ({ ...prev, mealTime: e.target.value }))}
                  className="w-full px-4 py-3 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <div>
                <label className="block text-white/70 font-semibold mb-2 text-sm">{t("Tipo de refeição")}</label>
                <select
                  value={editForm.mealType}
                  onChange={(e) => setEditForm(prev => ({ ...prev, mealType: e.target.value }))}
                  className="w-full px-4 py-3 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value="pequeno-almoco">{t("Pequeno Almoço")}</option>
                  <option value="almoco">{t("Almoço")}</option>
                  <option value="brunch">Brunch</option>
                  <option value="lanche">{t("Lanche")}</option>
                  <option value="jantar">{t("Jantar")}</option>
                  <option value="ceia">{t("Ceia")}</option>
                </select>
              </div>
              <div>
                <label className="block text-white/70 font-semibold mb-2 text-sm">{t("Duração (minutos)")}</label>
                <select
                  value={editForm.durationMinutes}
                  onChange={(e) => setEditForm(prev => ({ ...prev, durationMinutes: Number(e.target.value) }))}
                  className="w-full px-4 py-3 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value={30}>{t("30 minutos")}</option>
                  <option value={60}>{t("1 hora")}</option>
                  <option value={90}>{t("1.5 horas")}</option>
                  <option value={120}>{t("2 horas")}</option>
                  <option value={180}>{t("3 horas")}</option>
                  <option value={240}>{t("4 horas")}</option>
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-white/[0.06] flex justify-end space-x-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-6 py-2.5 bg-white/[0.04] text-white/70 rounded-lg hover:bg-white/[0.06] transition-colors font-medium"
              >
                {t("Cancelar")}
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="px-6 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors font-medium"
              >
                {saving ? t('A guardar...') : t('Guardar alterações')}
              </button>
            </div>
        </Modal>


      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} size="sm" ariaLabel={t("Confirmar eliminação")}>
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="apagar" className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-white/90 mb-2">{t("Eliminar refeição?")}</h3>
              <p className="text-white/50 text-sm mb-6">
                {t("Esta ação irá eliminar a refeição e todas as participações associadas. Esta ação não pode ser desfeita.")}
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-6 py-2.5 bg-white/[0.04] text-white/70 rounded-lg hover:bg-white/[0.06] transition-colors font-medium"
                >
                  {t("Cancelar")}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={saving}
                  className="flex-1 px-6 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors font-medium"
                >
                  {saving ? t('A eliminar...') : t('Eliminar')}
                </button>
              </div>
            </div>
        </Modal>

    </div>
    </ErrorBoundary>
  );
}