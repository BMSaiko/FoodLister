'use client';

import React, { useState } from 'react';
import { X, Calendar, Clock, Users, Mail, UtensilsCrossed } from 'lucide-react';
import { validateEmails } from '../../utils/formatters';
import { toast } from 'react-toastify';

type ScheduleDinnerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  restaurantName: string;
  restaurantLocation: string;
  restaurantDescription: string;
};

const ScheduleDinnerModal = ({
  isOpen,
  onClose,
  restaurantName,
  restaurantLocation,
  restaurantDescription
}: ScheduleDinnerModalProps) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [participants, setParticipants] = useState('');
  const [duration, setDuration] = useState(2); // hours
  const [mealType, setMealType] = useState('');

  const mealTypes = [
    { value: 'pequeno-almoco', label: 'Pequeno Almoço', icon: '☕', defaultTime: '08:00', defaultDuration: 1 },
    { value: 'almoco', label: 'Almoço', icon: '🍽️', defaultTime: '12:30', defaultDuration: 1.5 },
    { value: 'brunch', label: 'Brunch', icon: '🥐', defaultTime: '11:00', defaultDuration: 2 },
    { value: 'lanche', label: 'Lanche', icon: '🍪', defaultTime: '16:00', defaultDuration: 1 },
    { value: 'jantar', label: 'Jantar', icon: '🍽️', defaultTime: '19:00', defaultDuration: 2 },
    { value: 'ceia', label: 'Ceia', icon: '🌙', defaultTime: '22:00', defaultDuration: 1 }
  ];

  // Update time and duration when meal type changes
  const handleMealTypeChange = (newMealType: string) => {
    setMealType(newMealType);
    const selectedMeal = mealTypes.find(meal => meal.value === newMealType);
    if (selectedMeal && !time) { // Only update if time hasn't been manually set
      setTime(selectedMeal.defaultTime);
    }
    if (selectedMeal && duration === 2) { // Only update if duration is still default
      setDuration(selectedMeal.defaultDuration);
    }
  };

  // Auto-assign meal type based on selected time
  const handleTimeChange = (newTime: string) => {
    setTime(newTime);

    // Only auto-assign if meal type hasn't been manually selected and time is valid
    if (!mealType && newTime && newTime.includes(':')) {
      const timeParts = newTime.split(':');
      if (timeParts.length >= 2) {
        const hour = parseInt(timeParts[0], 10);
        if (!isNaN(hour) && hour >= 0 && hour <= 23) {
          let suggestedMealType = '';

          if (hour >= 6 && hour < 11) {
            suggestedMealType = 'pequeno-almoco';
          } else if (hour >= 11 && hour < 14) {
            suggestedMealType = 'almoco';
          } else if (hour >= 14 && hour < 17) {
            suggestedMealType = 'lanche';
          } else if (hour >= 17 && hour < 22) {
            suggestedMealType = 'jantar';
          } else if (hour >= 22 || hour < 6) {
            suggestedMealType = 'ceia';
          }

          // Check for brunch time (10-12) - overrides morning breakfast
          if (hour >= 10 && hour < 12) {
            suggestedMealType = 'brunch';
          }

          if (suggestedMealType) {
            setMealType(suggestedMealType);
            // Also set duration if still default
            const selectedMeal = mealTypes.find(meal => meal.value === suggestedMealType);
            if (selectedMeal && duration === 2) {
              setDuration(selectedMeal.defaultDuration);
            }
          }
        }
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Input validation
    if (!date || !time) {
      toast.error('Por favor, selecione data e hora.');
      return;
    }

    if (!mealType) {
      toast.error('Por favor, selecione o tipo de refeição.');
      return;
    }

    let startDateTime: Date;
    let endDateTime: Date;

    try {
      // Create start datetime with validation
      startDateTime = new Date(`${date}T${time}`);
      if (isNaN(startDateTime.getTime())) {
        throw new Error('Data ou hora inválida');
      }

      // Create end datetime
      endDateTime = new Date(startDateTime.getTime() + duration * 60 * 60 * 1000);
      if (isNaN(endDateTime.getTime())) {
        throw new Error('Erro ao calcular hora de fim');
      }

      // Ensure end time is after start time
      if (endDateTime <= startDateTime) {
        throw new Error('A hora de fim deve ser após a hora de início');
      }
    } catch (error) {
      toast.error(`Erro na validação de data/hora: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      return;
    }

    // Format for Google Calendar (YYYYMMDDTHHMMSSZ)
    // Note: Using UTC format - for local timezone, would need different approach
    const formatDateTime = (dt: Date) => {
      return dt.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    };

    const start = formatDateTime(startDateTime);
    const end = formatDateTime(endDateTime);

    // Prepare and validate participants emails
    let validEmails: string[] = [];
    if (participants.trim()) {
      const emailList = participants
        .split(',')
        .map(email => email.trim())
        .filter(email => email.length > 0);

      validEmails = validateEmails(emailList);

      // Warn about invalid emails but don't block
      const invalidCount = emailList.length - validEmails.length;
      if (invalidCount > 0) {
        toast.warn(`${invalidCount} email(s) inválido(s) foram ignorados. Apenas emails válidos serão incluídos.`);
      }
    }

    const emails = validEmails.join(',');

    // Get selected meal type label
    const selectedMeal = mealTypes.find(meal => meal.value === mealType);
    const mealLabel = selectedMeal ? selectedMeal.label : 'Refeição';

    // Prepare restaurant description with fallback
    const safeDescription = (restaurantDescription && restaurantDescription.trim())
      ? restaurantDescription.trim()
      : 'Descrição não disponível';

    // Create Google Calendar URL
    const baseUrl = 'https://calendar.google.com/calendar/u/0/r/eventedit';
    const params = new URLSearchParams({
      text: `${mealLabel} em ${restaurantName}`,
      dates: `${start}/${end}`,
      details: `${mealLabel} reservado no restaurante ${restaurantName}.\n\nDescrição: ${safeDescription}`,
      location: restaurantLocation,
      ...(emails && { add: emails })
    });

    const calendarUrl = `${baseUrl}?${params.toString()}`;

    // Open in new tab with error handling
    try {
      const newWindow = window.open(calendarUrl, '_blank', 'noopener,noreferrer');

      // Check if popup was blocked
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        toast.error('A janela popup foi bloqueada pelo navegador. Por favor, permita popups para este site e tente novamente.');
        return;
      }

      // Close modal on success
      toast.success('Evento criado com sucesso no Google Calendar!');
      onClose();
    } catch (error) {
      toast.error('Erro ao abrir o Google Calendar. Verifique as configurações do navegador.');
    }
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
              onClick={onClose}
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

          <form onSubmit={handleSubmit} className="space-y-5">
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
                  value={date}
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
                  value={time}
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
                value={mealType}
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
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-colors text-base text-gray-900 bg-gray-50 hover:bg-white"
              >
                <option value={0.5}>⚡ 30 min - Rápido</option>
                <option value={1}>🍽️ 1 hora - {mealType === 'pequeno-almoco' ? 'Pequeno almoço' : mealType === 'almoco' ? 'Almoço' : mealType === 'brunch' ? 'Brunch' : mealType === 'lanche' ? 'Lanche' : mealType === 'jantar' ? 'Jantar' : 'Ceia'} rápido</option>
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
                value={participants}
                onChange={(e) => setParticipants(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const textarea = e.target as HTMLTextAreaElement;
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;
                    const newValue = participants.substring(0, start) + ', ' + participants.substring(end);
                    setParticipants(newValue);
                    // Set cursor position after the comma and space
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

export default ScheduleDinnerModal;
