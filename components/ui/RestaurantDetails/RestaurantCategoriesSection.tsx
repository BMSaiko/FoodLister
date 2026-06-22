import React from 'react';
import { Tag } from 'lucide-react';

interface RestaurantCategoriesSectionProps {
  cuisineTypes?: any[];
  dietaryOptions?: any[];
  features?: any[];
  lists?: any[];
  restaurantId?: string;
  menuImages?: string[];
}

export default function RestaurantCategoriesSection({
  cuisineTypes = [],
  dietaryOptions = [],
  features = [],
  lists = [],
  restaurantId,
  menuImages = []
}: RestaurantCategoriesSectionProps) {

  const hasCategories = cuisineTypes.length > 0 || dietaryOptions.length > 0 || features.length > 0;

  if (!hasCategories) {
    return (
      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4 sm:p-6 mb-4">
        <div className="text-center py-6">
          <div className="bg-white/[0.05] rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
            <Tag className="h-6 w-6 text-white/30" />
          </div>
          <h3 className="text-base font-semibold text-white/60 mb-2">Sem categorias definidas</h3>
          <p className="text-white/40 text-xs">
            Este restaurante ainda nao possui categorias ou caracteristicas definidas
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4 sm:p-6 mb-4">
      <div className="space-y-4 sm:space-y-5">
        {cuisineTypes.length > 0 && (
          <div>
            <div className="flex items-center mb-2 sm:mb-3">
              <span className="text-xs sm:text-sm font-medium text-amber-400 flex items-center gap-1.5">
                {'🍽️'} Culinaria
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {cuisineTypes.map((type, index) => (
                <span
                  key={type.cuisine_type?.id || ('cuisine-' + index)}
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20"
                >
                  {type.cuisine_type?.name || type.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {dietaryOptions.length > 0 && (
          <div>
            <div className="flex items-center mb-2 sm:mb-3">
              <span className="text-xs sm:text-sm font-medium text-green-400 flex items-center gap-1.5">
                {'🥗'} Opcoes Dieteticas
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {dietaryOptions.map((option, index) => (
                <span
                  key={option.dietary_option?.id || ('dietary-' + index)}
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-green-500/10 text-green-400 border border-green-500/20"
                >
                  {option.dietary_option?.name || option.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {features.length > 0 && (
          <div>
            <div className="flex items-center mb-2 sm:mb-3">
              <span className="text-xs sm:text-sm font-medium text-white/70 flex items-center gap-1.5">
                {'⭐'} Recursos
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {features.map((feature, index) => (
                <span
                  key={feature.feature?.id || ('feature-' + index)}
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-white/[0.05] text-white/70 border border-white/10"
                >
                  {feature.feature?.name || feature.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
