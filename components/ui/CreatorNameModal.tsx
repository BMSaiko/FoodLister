// components/ui/CreatorNameModal.tsx (versão responsiva)
'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

type CreatorNameModalProps = {
  onSave: (name: string) => void;
};

const CreatorNameModal = ({ onSave }: CreatorNameModalProps) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Por favor, digite seu nome.');
      return;
    }
    
    // Salvar o nome nos cookies para uso futuro
    document.cookie = `creatorName=${encodeURIComponent(name)}; path=/; max-age=${60 * 60 * 24 * 365}`; // 1 ano
    
    onSave(name);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-4 sm:p-6 mx-3">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">Bem-vindo ao FoodLister!</h3>
          <button 
            onClick={() => onSave('')} 
            className="text-gray-500 hover:text-gray-700"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <p className="text-gray-600 mb-4 text-sm sm:text-base">
          Para personalizarmos sua experiência, digite seu nome abaixo. Usaremos isso para atribuir os restaurantes e listas que você criar.
        </p>
        
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
              {error}
            </div>
          )}
          
          <div className="mb-4">
            <label htmlFor="creatorName" className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
              Seu Nome
            </label>
            <input
              type="text"
              id="creatorName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 text-base"
              placeholder="Digite seu nome"
            />
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 min-h-[44px] text-sm sm:text-base"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatorNameModal;