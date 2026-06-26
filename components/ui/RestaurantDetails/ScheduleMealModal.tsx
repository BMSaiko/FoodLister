'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { X, Calendar, Clock, Users, Mail, UtensilsCrossed, Search, Loader2 } from 'lucide-react';
import { useMealScheduling } from '@/hooks/forms/useMealScheduling';
import { useDebounce } from '@/hooks/utilities/useDebounce';
import { toast } from 'react-toastify';
import Modal from '@/components/ui/Modal';

interface SearchResult {
  id: string;
  name: string | null;
  profileImage: string | null;
  userIdCode: string | null;
}

type ScheduleMealModalProps = {
  isOpen: boolean;
  onClose: () => void;
  restaurantName: string;
  restaurantLocation: string;
  restaurantDescription: string;
  restaurantId?: string;
};

const ScheduleMealModal = ({
  isOpen,
  onClose,
  restaurantName,
  restaurantLocation,
  restaurantDescription,
  restaurantId
}: ScheduleMealModalProps) => {
  const router = useRouter();
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

  // User search state
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<SearchResult[]>([]);
  const [showEmailFallback, setShowEmailFallback] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Search users on debounced query change
  useEffect(() => {
    if (!debouncedSearch || debouncedSearch.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const searchUsers = async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`/api/users/search?q=${encodeURIComponent(debouncedSearch)}`);
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.data || []);
          setShowDropdown(true);
        }
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setIsSearching(false);
      }
    };

    searchUsers();
  }, [debouncedSearch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectUser = useCallback((user: SearchResult) => {
    if (!selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers(prev => [...prev, user]);
    }
    setSearchQuery('');
    setSearchResults([]);
    setShowDropdown(false);
    searchInputRef.current?.focus();
  }, [selectedUsers]);

  const handleRemoveUser = useCallback((userId: string) => {
    setSelectedUsers(prev => prev.filter(u => u.id !== userId));
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!restaurantId) {
      toast.error('Erro: restaurante não identificado.');
      return;
    }

    try {
      const participantIds = selectedUsers.map(u => u.id);
       
      const response = await fetch('/api/meals/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          mealDate: form.date,
          mealTime: form.time,
          mealType: form.mealType,
          durationMinutes: form.duration * 60,
          participantUserIds: participantIds
        })
      });

      if (response.ok) {
        const result = await response.json();
        const mealId = result.data?.id;
         
        // Show success toast
        toast.success('Refeição agendada com sucesso!');
         
        // Reset form and close modal
        resetForm();
        setSelectedUsers([]);
        setSearchQuery('');
        onClose();
         
        // Redirect to meal details page
        if (mealId) {
          router.push(`/meals/${mealId}`);
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Erro ao agendar refeição. Tente novamente.');
      }
    } catch (error) {
      console.error('Error scheduling meal:', error);
      toast.error('Erro de conexão ao agendar refeição. Tente novamente.');
    }
  };

  const handleClose = () => {
    resetForm();
    setSelectedUsers([]);
    setSearchQuery('');
    setShowDropdown(false);
    onClose();
  };

  const getMealTypeLabel = (value: string): string => {
    const meal = mealTypes.find(m => m.value === value);
    return meal ? meal.label : 'Refeição';
  };

  // Filter out already selected users from results
  const filteredResults = searchResults.filter(
    user => !selectedUsers.find(u => u.id === user.id)
  );

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg" ariaLabel="Agendar Refeição">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500/[0.08] to-orange-500/[0.08] px-6 py-4 rounded-t-xl border-b border-white/[0.06]">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-500/[0.12] rounded-lg">
                <UtensilsCrossed className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white/90">Agendar Refeição</h3>
                <p className="text-sm text-amber-300 font-medium">{restaurantName}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white/40 hover:text-white/60 hover:bg-white/10 rounded-full p-1 transition-colors"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <p className="text-white/60 mb-6 text-sm">
            Preencha os detalhes abaixo para agendar uma refeição neste restaurante.
          </p>

          <form onSubmit={handleFormSubmit} className="space-y-5">
            {/* Date and Time Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-white/70 font-semibold mb-2 text-sm flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-amber-400" />
                  Data
                </label>
                <input
                  type="date"
                  id="date"
                  value={form.date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-500/50 transition-colors text-base bg-white/[0.03] hover:bg-white/[0.03]"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div>
                <label htmlFor="time" className="block text-white/70 font-semibold mb-2 text-sm flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-amber-400" />
                  Hora
                </label>
                <input
                  type="time"
                  id="time"
                  value={form.time}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="w-full px-4 py-3 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-500/50 transition-colors text-base bg-white/[0.03] hover:bg-white/[0.03]"
                  required
                />
              </div>
            </div>

            {/* Meal Type */}
            <div>
              <label htmlFor="mealType" className="block text-white/70 font-semibold mb-2 text-sm flex items-center">
                <UtensilsCrossed className="h-4 w-4 mr-2 text-amber-400" />
                Tipo de refeição
              </label>
              <select
                id="mealType"
                value={form.mealType}
                onChange={(e) => handleMealTypeChange(e.target.value)}
                className="w-full px-4 py-3 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-500/50 transition-colors text-base text-white/90 bg-white/[0.03] hover:bg-white/[0.03]"
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
              <label htmlFor="duration" className="block text-white/70 font-semibold mb-2 text-sm">
                Duração da reserva
              </label>
              <select
                id="duration"
                value={form.duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-4 py-3 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-500/50 transition-colors text-base text-white/90 bg-white/[0.03] hover:bg-white/[0.03]"
              >
                <option value={0.5}>⚡ 30 min - Rápido</option>
                <option value={1}>🍽️ 1 hora - {getMealTypeLabel(form.mealType)} rápido</option>
                <option value={1.5}>🍽️ 1.5 horas - Normal</option>
                <option value={2}>🍽️ 2 horas - Completo</option>
                <option value={3}>🍽️ 3 horas - Especial</option>
                <option value={4}>🍽️ 4 horas - Evento longo</option>
              </select>
            </div>

            {/* Participants - User Search */}
            <div>
              <label className="block text-white/70 font-semibold mb-2 text-sm flex items-center">
                <Users className="h-4 w-4 mr-2 text-amber-400" />
                Convidar participantes
              </label>

              {/* Selected Users Chips */}
              {selectedUsers.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedUsers.map(user => (
                    <div
                      key={user.id}
                      className="flex items-center space-x-2 bg-amber-500/[0.08] border border-amber-500/20 rounded-full px-3 py-1.5"
                    >
                      {user.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt=""
                          className="h-6 w-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-amber-500/20 flex items-center justify-center text-xs font-medium text-amber-300">
                          {user.name?.charAt(0) || user.userIdCode?.charAt(0) || '?'}
                        </div>
                      )}
                      <span className="text-sm text-white/70">
                        {user.name || user.userIdCode}
                      </span>
                      {user.userIdCode && (
                        <span className="text-xs text-white/50">({user.userIdCode})</span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveUser(user.id)}
                        className="text-white/40 hover:text-white/60 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Search Input */}
              <div ref={searchRef} className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                    placeholder="Pesquisar por nome, ID (FL000001) ou email..."
                    className="w-full pl-10 pr-4 py-3 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-500/50 transition-colors text-base bg-white/[0.03] hover:bg-white/[0.03]"
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40 animate-spin" />
                  )}
                </div>

                {/* Search Results Dropdown */}
                {showDropdown && filteredResults.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white/[0.03] border border-white/[0.08] rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredResults.map(user => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleSelectUser(user)}
                        className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-white/[0.03] transition-colors text-left"
                      >
                        {user.profileImage ? (
                          <img
                            src={user.profileImage}
                            alt=""
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-amber-500/20 flex items-center justify-center text-sm font-medium text-amber-300">
                            {user.name?.charAt(0) || '?'}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white/90 truncate">
                            {user.name || 'Utilizador'}
                          </p>
                          {user.userIdCode && (
                            <p className="text-xs text-white/50">{user.userIdCode}</p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* No results message */}
                {showDropdown && debouncedSearch.length >= 2 && filteredResults.length === 0 && !isSearching && (
                  <div className="absolute z-10 mt-1 w-full bg-white/[0.03] border border-white/[0.08] rounded-lg shadow-lg p-4 text-center">
                    <p className="text-sm text-white/50">Nenhum utilizador encontrado</p>
                  </div>
                )}
              </div>

              {/* Email Fallback Toggle */}
              <button
                type="button"
                onClick={() => setShowEmailFallback(!showEmailFallback)}
                className="mt-2 text-sm text-amber-400 hover:text-amber-300 flex items-center"
              >
                <Mail className="h-3 w-3 mr-1" />
                {showEmailFallback ? 'Ocultar campo de email' : 'Ou adicionar por email'}
              </button>

              {/* Email Fallback Textarea */}
              {showEmailFallback && (
                <div className="mt-2">
                  <textarea
                    value={form.participants}
                    onChange={(e) => setParticipants(e.target.value)}
                    placeholder="exemplo@email.com, outro@email.com"
                    className="w-full px-4 py-3 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-500/50 transition-colors text-base bg-white/[0.03] hover:bg-white/[0.03] resize-none"
                    rows={2}
                  />
                </div>
              )}

              <div className="text-xs text-white/50 mt-2">
                <p className="flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  Pesquisa utilizadores registados ou adiciona por email
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end pt-6 border-t border-white/[0.06]">
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all font-semibold shadow-md hover:shadow-lg"
              >
                📅 Agendar Refeição
              </button>
            </div>
          </form>
        </div>
    </Modal>
  );
};

export default ScheduleMealModal;