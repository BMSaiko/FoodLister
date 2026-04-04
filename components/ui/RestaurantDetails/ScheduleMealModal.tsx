'use client';

import React from 'react';
import { X, Calendar, Clock, Users, Mail, UtensilsCrossed } from 'lucide-react';
import { useMealScheduling } from '@/hooks/forms/useMealScheduling';

type ScheduleMealModalProps = {
  isOpen: boolean;
  onClose: () => void;
  restaurantName: string;
  restaurantLocation: string;
  restaurantDescription: string;
};

const ScheduleMealModal = ({
  isOpen,
  onClose,
  restaurantName,
  restaurantLocation,
  restaurantDescription
}: ScheduleMealModalProps) => {
  const {
    form,
    setDate,
    setParticipants,
    setDuration,
    handleMealTypeChange,
    handleTimeChange,
    handleSubmit,
    resetForm,
    mealTypes
  } = useMealScheduling({
    onSuccess: onClose
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(restaurantName, restaurantLocation, restaurantDescription);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const getMealTypeLabel = (value: string): string => {
    const meal = mealTypes.find(m => m.value === value);
    return meal ? meal.label : 'Refeição';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 rounded-t-xl border-b border-gray-100">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <UtensilsCrossed className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Agendar Refeição</h3>
                <p className="text-sm text-amber-700 font-medium">{restaurantName}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <p className="text-gray-600 mb-6 text-sm">
            Preencha os detalhes abaixo para criar um evento no seu Google Calendar.
          </p>

          <form onSubmit={handleFormSubmit} className="space-y-5">
            {/* Date and Time Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-gray-700 font-semibold mb-2 text-sm flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-amber-500" />
                  Data
                </label>
                <input
                  type="date"
                  id="date"
                  value={form.date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-colors text-base bg-gray-50 hover:bg-white"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div>
                <label htmlFor="time" className="block text-gray-700 font-semibold mb-2 text-sm flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-amber-500" />
                  Hora
                </label>
                <input
                  type="time"
                  id="time"
                  value={form.time}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-colors text-base bg-gray-50 hover:bg-white"
                  required
                />
              </div>
            </div>

            {/* Meal Type */}
            <div>
              <label htmlFor="mealType" className="block text-gray-700 font-semibold mb-2 text-sm flex items-center">
                <UtensilsCrossed className="h-4 w-4 mr-2 text-amber-500" />
                Tipo de refeição
              </label>
              <select
                id="mealType"
                value={form.mealType}
                onChange={(e) => handleMealTypeChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-colors text-base text-gray-900 bg-gray-50 hover:bg-white"
                required
              >
                <option value="" disabled>Selecione um tipo de refeição</option>
                {mealTypes.map((meal) => (
                  <option key={meal.value} value={meal.value}>
                    {meal.icon} {meal.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration */}
            <div>
              <label htmlFor="duration" className="block text-gray-700 font-semibold mb-2 text-sm">
                Duração da reserva
              </label>
              <select
                id="duration"
                value={form.duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-colors text-base text-gray-900 bg-gray-50 hover:bg-white"
              >
                <option value={0.5}>⚡ 30 min - Rápido</option>
                <option value={1}>🍽️ 1 hora - {getMealTypeLabel(form.mealType)} rápido</option>
                <option value={1.5}>🍽️ 1.5 horas - Normal</option>
                <option value={2}>🍽️ 2 horas - Completo</option>
                <option value={3}>🍽️ 3 horas - Especial</option>
                <option value={4}>🍽️ 4 horas - Evento longo</option>
              </select>
            </div>

            {/* Participants */}
            <div>
              <label htmlFor="participants" className="block text-gray-700 font-semibold mb-2 text-sm flex items-center">
                <Mail className="h-4 w-4 mr-2 text-amber-500" />
                Convidar participantes
              </label>
              <textarea
                id="participants"
                value={form.participants}
                onChange={(e) => setParticipants(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const textarea = e.target as HTMLTextAreaElement;
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;
                    const currentValue = form.participants;
                    const newValue = currentValue.substring(0, start) + ', ' + currentValue.substring(end);
                    setParticipants(newValue);
                    setTimeout(() => {
                      textarea.selectionStart = textarea.selectionEnd = start + 2;
                    }, 0);
                  }
                }}
                placeholder="exemplo@email.com, outro@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-colors text-base bg-gray-50 hover:bg-white resize-none"
                rows={3}
              />
              <div className="text-xs text-gray-500 mt-2">
                <p className="flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  Opcional: os participantes receberão convites automáticos
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end pt-6 border-t border-gray-100">
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all font-semibold shadow-md hover:shadow-lg"
              >
                📅 Criar Evento no Calendar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ScheduleMealModal;
