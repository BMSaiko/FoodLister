'use client';

import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { validateEmails } from '@/utils/formatters';
import { generateGoogleCalendarUrl, openGoogleCalendarEvent } from '@/utils/googleCalendar';

/**
 * Meal type definition with default time and duration
 */
export interface MealType {
  value: string;
  label: string;
  icon: string;
  defaultTime: string;
  defaultDuration: number; // in hours
}

/**
 * Default meal types used in the scheduling feature
 */
export const DEFAULT_MEAL_TYPES: MealType[] = [
  { value: 'pequeno-almoco', label: 'Pequeno Almoço', icon: '☕', defaultTime: '08:00', defaultDuration: 1 },
  { value: 'almoco', label: 'Almoço', icon: '🍽️', defaultTime: '12:30', defaultDuration: 1.5 },
  { value: 'brunch', label: 'Brunch', icon: '🥐', defaultTime: '11:00', defaultDuration: 2 },
  { value: 'lanche', label: 'Lanche', icon: '🍪', defaultTime: '16:00', defaultDuration: 1 },
  { value: 'jantar', label: 'Jantar', icon: '🍽️', defaultTime: '19:00', defaultDuration: 2 },
  { value: 'ceia', label: 'Ceia', icon: '🌙', defaultTime: '22:00', defaultDuration: 1 }
];

/**
 * Form state for meal scheduling
 */
export interface MealScheduleForm {
  date: string;
  time: string;
  participants: string;
  duration: number;
  mealType: string;
}

/**
 * Options for the useMealScheduling hook
 */
export interface UseMealSchedulingOptions {
  /** Custom meal types (defaults to DEFAULT_MEAL_TYPES) */
  mealTypes?: MealType[];
  /** Default duration in hours */
  defaultDuration?: number;
  /** Callback when event is successfully created */
  onSuccess?: () => void;
}

/**
 * Hook for managing meal scheduling logic
 * 
 * Extracts all scheduling logic from ScheduleMealModal including:
 * - Form state management
 * - Meal type selection with auto-assignment
 * - Date/time validation
 * - Google Calendar URL generation
 * - Email validation for participants
 */
export function useMealScheduling(options: UseMealSchedulingOptions = {}) {
  const {
    mealTypes = DEFAULT_MEAL_TYPES,
    defaultDuration = 2,
    onSuccess
  } = options;

  const [form, setForm] = useState<MealScheduleForm>({
    date: '',
    time: '',
    participants: '',
    duration: defaultDuration,
    mealType: ''
  });

  /**
   * Update a single form field
   */
  const updateField = useCallback(<K extends keyof MealScheduleForm>(field: K, value: MealScheduleForm[K]) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setForm({
      date: '',
      time: '',
      participants: '',
      duration: defaultDuration,
      mealType: ''
    });
  }, [defaultDuration]);

  /**
   * Handle meal type change - updates time and duration if not manually set
   */
  const handleMealTypeChange = useCallback((newMealType: string) => {
    const selectedMeal = mealTypes.find(meal => meal.value === newMealType);
    if (!selectedMeal) return;

    setForm(prev => ({
      ...prev,
      mealType: newMealType,
      // Only update time if it's still empty (not manually set)
      time: prev.time || selectedMeal.defaultTime,
      // Only update duration if it's still the default
      duration: prev.duration === defaultDuration ? selectedMeal.defaultDuration : prev.duration
    }));
  }, [mealTypes, defaultDuration]);

  /**
   * Auto-assign meal type based on selected time
   */
  const handleTimeChange = useCallback((newTime: string) => {
    if (!newTime || !newTime.includes(':')) {
      setForm(prev => ({ ...prev, time: newTime }));
      return;
    }

    const timeParts = newTime.split(':');
    const hour = parseInt(timeParts[0], 10);

    if (isNaN(hour) || hour < 0 || hour > 23) {
      setForm(prev => ({ ...prev, time: newTime }));
      return;
    }

    // Determine meal type based on hour
    let suggestedMealType = '';
    
    if (hour >= 6 && hour < 10) {
      suggestedMealType = 'pequeno-almoco';
    } else if (hour >= 10 && hour < 12) {
      suggestedMealType = 'brunch'; // Brunch takes precedence over breakfast
    } else if (hour >= 12 && hour < 14) {
      suggestedMealType = 'almoco';
    } else if (hour >= 14 && hour < 17) {
      suggestedMealType = 'lanche';
    } else if (hour >= 17 && hour < 22) {
      suggestedMealType = 'jantar';
    } else if (hour >= 22 || hour < 6) {
      suggestedMealType = 'ceia';
    }

    const selectedMeal = mealTypes.find(meal => meal.value === suggestedMealType);

    setForm(prev => ({
      ...prev,
      time: newTime,
      mealType: suggestedMealType,
      // Update duration if still at default
      duration: prev.duration === defaultDuration && selectedMeal 
        ? selectedMeal.defaultDuration 
        : prev.duration
    }));
  }, [mealTypes, defaultDuration]);

  /**
   * Get the label for the currently selected meal type
   */
  const getSelectedMealLabel = useCallback((): string => {
    const selectedMeal = mealTypes.find(meal => meal.value === form.mealType);
    return selectedMeal ? selectedMeal.label : 'Refeição';
  }, [mealTypes, form.mealType]);

  /**
   * Validate the form and return errors if any
   */
  const validateForm = useCallback((): string | null => {
    if (!form.date || !form.time) {
      return 'Por favor, selecione data e hora.';
    }

    if (!form.mealType) {
      return 'Por favor, selecione o tipo de refeição.';
    }

    // Validate date/time is not in the past
    const startDateTime = new Date(`${form.date}T${form.time}`);
    if (isNaN(startDateTime.getTime())) {
      return 'Data ou hora inválida.';
    }

    const now = new Date();
    now.setMinutes(0, 0, 0); // Round down to nearest hour for comparison
    if (startDateTime < now) {
      return 'Não é possível agendar refeições no passado.';
    }

    // Validate end time is after start time
    const endDateTime = new Date(startDateTime.getTime() + form.duration * 60 * 60 * 1000);
    if (endDateTime <= startDateTime) {
      return 'A hora de fim deve ser após a hora de início.';
    }

    return null;
  }, [form.date, form.time, form.mealType, form.duration]);

  /**
   * Parse and validate participant emails
   */
  const getValidatedEmails = useCallback((): { validEmails: string[]; invalidCount: number } => {
    if (!form.participants.trim()) {
      return { validEmails: [], invalidCount: 0 };
    }

    const emailList = form.participants
      .split(',')
      .map(email => email.trim())
      .filter(email => email.length > 0);

    const validEmails = validateEmails(emailList);
    const invalidCount = emailList.length - validEmails.length;

    return { validEmails, invalidCount };
  }, [form.participants]);

  /**
   * Submit the form and open Google Calendar
   */
  const handleSubmit = useCallback((
    restaurantName: string,
    restaurantLocation: string,
    restaurantDescription: string
  ): boolean => {
    // Validate form
    const error = validateForm();
    if (error) {
      toast.error(error);
      return false;
    }

    // Create start datetime
    const startDateTime = new Date(`${form.date}T${form.time}`);
    const endDateTime = new Date(startDateTime.getTime() + form.duration * 60 * 60 * 1000);

    // Validate emails
    const { validEmails, invalidCount } = getValidatedEmails();
    if (invalidCount > 0) {
      toast.warn(`${invalidCount} email(s) inválido(s) foram ignorados. Apenas emails válidos serão incluídos.`);
    }

    // Get meal label
    const mealLabel = getSelectedMealLabel();

    // Prepare description with fallback
    const safeDescription = (restaurantDescription && restaurantDescription.trim())
      ? restaurantDescription.trim()
      : 'Descrição não disponível';

    // Generate Google Calendar URL
    const calendarUrl = generateGoogleCalendarUrl({
      title: `${mealLabel} em ${restaurantName}`,
      startDate: startDateTime,
      endDate: endDateTime,
      description: `${mealLabel} reservado no restaurante ${restaurantName}.\n\nDescrição: ${safeDescription}`,
      location: restaurantLocation,
      attendees: validEmails.length > 0 ? validEmails : undefined
    });

    // Open Google Calendar
    const newWindow = openGoogleCalendarEvent(calendarUrl);
    if (!newWindow) {
      toast.error('A janela popup foi bloqueada pelo navegador. Por favor, permita popups para este site e tente novamente.');
      return false;
    }

    toast.success('Evento criado com sucesso no Google Calendar!');
    resetForm();
    onSuccess?.();
    return true;
  }, [form.date, form.time, form.duration, validateForm, getValidatedEmails, getSelectedMealLabel, resetForm, onSuccess]);

  return {
    // Form state
    form,
    
    // Form setters (for direct field updates)
    updateField,
    setDate: (date: string) => updateField('date', date),
    setTime: (time: string) => updateField('time', time),
    setParticipants: (participants: string) => updateField('participants', participants),
    setDuration: (duration: number) => updateField('duration', duration),
    setMealType: (mealType: string) => updateField('mealType', mealType),
    
    // Special handlers
    handleMealTypeChange,
    handleTimeChange,
    
    // Actions
    handleSubmit,
    resetForm,
    
    // Data
    mealTypes,
    selectedMealLabel: getSelectedMealLabel()
  };
}

export default useMealScheduling;