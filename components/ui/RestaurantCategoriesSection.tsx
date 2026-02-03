import React from 'react';
import { Tag } from 'lucide-react';

interface RestaurantCategoriesSectionProps {
  cuisineTypes?: any[];
  dietaryOptions?: any[];
  features?: any[];
}

export default function RestaurantCategoriesSection({
  cuisineTypes = [],
  dietaryOptions = [],
  features = []
}: RestaurantCategoriesSectionProps) {
  
  // Check if we have any categories to display
  const hasCategories = cuisineTypes.length > 0 || dietaryOptions.length > 0 || features.length > 0;

  if (!hasCategories) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6 mb-4">
        <div className="text-center py-6">
          <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-full w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
            <Tag className="h-6 w-6 sm:h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-2">Sem categorias definidas</h3>
          <p className="text-gray-500 text-xs sm:text-sm">
            Este restaurante ainda não possui categorias ou características definidas
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6 mb-4">
      <div className="space-y-4 sm:space-y-6">
        {/* Culinária */}
        {cuisineTypes.length > 0 && (
          <div className="border-b border-gray-100 pb-4 sm:pb-6 last:border-b-0 last:pb-0">
            <div className="flex items-center mb-3 sm:mb-4">
              <div className="flex items-center px-2 py-1 sm:px-3 sm:py-1.5 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 mr-2 sm:mr-3">
                <span className="text-lg mr-1 sm:mr-2">🍽️</span>
                <span className="text-xs sm:text-sm font-medium">Culinária</span>
              </div>
              <span className="text-xs text-gray-500">Tipos de cozinha</span>
            </div>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {cuisineTypes.map((type, index) => (
                <span 
                  key={type.cuisine_type?.id || `cuisine-${index}`} 
                  className="inline-flex items-center px-2 py-1 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-sm font-medium bg-gradient-to-r from-amber-50 to-orange-50 text-amber-800 border border-amber-200 hover:shadow-sm transition-all duration-200 hover:scale-105 hover:border-amber-300"
                >
                  <Tag className="h-3 w-3 sm:h-4 w-4 mr-1 sm:mr-2 text-amber-600" />
                  {type.cuisine_type?.name || type.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Opções Dietéticas */}
        {dietaryOptions.length > 0 && (
          <div className="border-b border-gray-100 pb-4 sm:pb-6 last:border-b-0 last:pb-0">
            <div className="flex items-center mb-3 sm:mb-4">
              <div className="flex items-center px-2 py-1 sm:px-3 sm:py-1.5 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 mr-2 sm:mr-3">
                <span className="text-lg mr-1 sm:mr-2">🥗</span>
                <span className="text-xs sm:text-sm font-medium">Opções Dietéticas</span>
              </div>
              <span className="text-xs text-gray-500">Restrições alimentares</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              {dietaryOptions.map((option, index) => (
                <div 
                  key={option.dietary_option?.id || `dietary-${index}`} 
                  className="flex items-center p-2 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg sm:rounded-xl border border-green-200 hover:shadow-md transition-all duration-200 hover:scale-105 hover:border-green-300 group"
                  title={option.dietary_option?.description || option.description || option.name}
                >
                  <div className="flex-shrink-0 bg-white rounded-full p-1 sm:p-2 shadow-sm mr-2 sm:mr-4 group-hover:scale-110 transition-transform duration-200">
                    <span className="text-lg">{option.dietary_option?.icon || option.icon || '🥗'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-green-800">{option.dietary_option?.name || option.name}</span>
                    {option.dietary_option?.description && (
                      <p className="text-xs text-green-600 mt-1 italic line-clamp-2">{option.dietary_option.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recursos do Restaurante */}
        {features.length > 0 && (
          <div className="border-b border-gray-100 pb-4 sm:pb-6 last:border-b-0 last:pb-0">
            <div className="flex items-center mb-3 sm:mb-4">
              <div className="flex items-center px-2 py-1 sm:px-3 sm:py-1.5 rounded-full bg-gradient-to-r from-blue-100 to-sky-100 text-blue-800 mr-2 sm:mr-3">
                <span className="text-lg mr-1 sm:mr-2">⭐</span>
                <span className="text-xs sm:text-sm font-medium">Recursos Disponíveis</span>
              </div>
              <span className="text-xs text-gray-500">Comodidades e serviços</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
              {features.map((feature, index) => (
                <div 
                  key={feature.feature?.id || `feature-${index}`} 
                  className="flex items-center p-2 sm:p-4 bg-gradient-to-r from-blue-50 to-sky-50 rounded-lg sm:rounded-xl border border-blue-200 hover:shadow-md transition-all duration-200 hover:scale-105 hover:border-blue-300 group"
                  title={feature.feature?.description || feature.description || feature.name}
                >
                  <div className="flex-shrink-0 bg-white rounded-full p-1 sm:p-2 shadow-sm mr-2 sm:mr-4 group-hover:scale-110 transition-transform duration-200">
                    <span className="text-lg">{feature.feature?.icon || feature.icon || '⭐'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-blue-800">{feature.feature?.name || feature.name}</span>
                    {feature.feature?.description && (
                      <p className="text-xs text-blue-600 mt-1 italic line-clamp-2">{feature.feature.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
