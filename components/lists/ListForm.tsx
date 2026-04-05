/**
 * ListForm - Shared form component for creating and editing lists
 * Used by both CreateList and EditList pages
 */

"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Search } from 'lucide-react';
import { VisibilityToggle, SelectedRestaurants } from 'components/ui/lists/ListFormFields';
import ListTagsInput from 'components/ui/lists/ListTagsInput';
import { ListFormData, Restaurant } from 'hooks/forms/useListForm';

interface ListFormProps {
  mode: 'create' | 'edit';
  formData: ListFormData;
  selectedRestaurants: Restaurant[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  backLink: string;
  backText: string;
  onFormChange: (data: Partial<ListFormData>) => void;
  onSubmit: () => void;
  onAddRestaurant: (restaurant: Restaurant) => void;
  onRemoveRestaurant: (restaurantId: string) => void;
  availableRestaurants: Restaurant[];
}

export default function ListForm({
  mode,
  formData,
  selectedRestaurants,
  loading,
  saving,
  error,
  backLink,
  backText,
  onFormChange,
  onSubmit,
  onAddRestaurant,
  onRemoveRestaurant,
  availableRestaurants
}: ListFormProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const isCreate = mode === 'create';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-amber-50/30">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <Link href={backLink} className="inline-flex items-center text-amber-600 mb-4 sm:mb-6 hover:underline transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {backText}
        </Link>
        
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-2xl mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 sm:px-6 py-4 sm:py-6">
            <h1 className="text-2xl font-bold text-white">
              {isCreate ? 'Criar Nova Lista' : 'Editar Lista'}
            </h1>
            <p className="text-amber-100 text-sm mt-1">
              {isCreate 
                ? 'Adicione seus restaurantes favoritos a uma lista personalizada' 
                : 'Atualize os detalhes e restaurantes da sua lista'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-200">
                {error}
              </div>
            )}
            
            {/* Name */}
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">
                Nome da Lista *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={(e) => onFormChange({ name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                placeholder={isCreate ? "Ex: Melhores restaurantes italianos" : undefined}
                required
              />
            </div>
            
            {/* Description */}
            <div className="mb-6">
              <label htmlFor="description" className="block text-gray-700 font-semibold mb-2">
                Descrição
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={(e) => onFormChange({ description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                placeholder="Descreva o tema desta lista..."
              />
            </div>
            
            {/* Visibility Toggle */}
            <VisibilityToggle 
              isPublic={formData.isPublic} 
              onChange={(isPublic) => onFormChange({ isPublic })} 
            />
            
            {/* Cover Image URL */}
            <div className="mb-6">
              <label htmlFor="cover_image_url" className="block text-gray-700 font-semibold mb-2">
                URL da Imagem de Capa
              </label>
              <input
                type="url"
                id="cover_image_url"
                name="cover_image_url"
                value={formData.cover_image_url || ''}
                onChange={(e) => onFormChange({ cover_image_url: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                placeholder="https://exemplo.com/imagem.jpg"
              />
              {formData.cover_image_url && (
                <div className="mt-2 rounded-lg overflow-hidden border border-gray-200">
                  <img 
                    src={formData.cover_image_url} 
                    alt="Preview da capa" 
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
            
            {/* Tags */}
            <div className="mb-6">
              <ListTagsInput
                tags={formData.tags || []}
                onChange={(tags) => onFormChange({ tags })}
              />
            </div>
            
            {/* Restaurant Search */}
            <div className="mb-6">
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  <Search className="h-4 w-4 inline mr-2" />
                  Buscar Restaurantes
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nome..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                />
              </div>
              <div className="max-h-48 overflow-y-auto bg-gray-50 rounded-xl border border-gray-200">
                {availableRestaurants.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {availableRestaurants.map(restaurant => (
                      <li
                        key={restaurant.id}
                        className="flex items-center justify-between p-3 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">{restaurant.name}</p>
                          {restaurant.location && (
                            <p className="text-sm text-gray-500 truncate">{restaurant.location}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => onAddRestaurant(restaurant)}
                          className="ml-3 px-3 py-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium"
                        >
                          Adicionar
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="p-4 text-center text-gray-500">
                    {searchQuery ? 'Nenhum restaurante encontrado' : 'Nenhum restaurante disponível'}
                  </p>
                )}
              </div>
            </div>
            
            {/* Selected Restaurants */}
            <SelectedRestaurants 
              restaurants={selectedRestaurants} 
              onRemove={onRemoveRestaurant} 
            />
            
            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push(backLink)}
                className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={saving}
              >
                {saving ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Salvando...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    <span>{isCreate ? 'Criar Lista' : 'Salvar Alterações'}</span>
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}