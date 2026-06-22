'use client';

import { motion } from 'motion/react';
import { Star, MapPin } from 'lucide-react';
import ListCardCover from '@/components/ui/lists/ListCardCover';

interface RestaurantFormPreviewProps {
  formData: {
    name: string;
    description: string;
    location: string;
    rating?: number;
    price_per_person?: number;
    images: string[];
    selectedCuisineTypes: string[];
  };
}

export default function RestaurantFormPreview({ formData }: RestaurantFormPreviewProps) {
  const hasImage = formData.images && formData.images.length > 0;
  const imageUrl = hasImage ? formData.images[0] : '';

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="sticky top-24"
    >
      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4">
        <h3 className="text-sm font-medium text-[var(--foreground-muted)] mb-3">Preview ao vivo</h3>

        {/* Card preview */}
        <div className="rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.06]">
          {/* Cover */}
          <div className="relative h-32">
            {hasImage ? (
              <img src={imageUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <ListCardCover name={formData.name || 'Restaurante'} className="h-full" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

            {formData.price_per_person != null && formData.price_per_person > 0 && (
              <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs font-semibold text-white">
                €{formData.price_per_person ?? 0}
              </div>
            )}

            {formData.rating != null && formData.rating > 0 && (
              <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span className="text-xs font-semibold text-white">{formData.rating?.toFixed(1) ?? "0.0"}</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-3">
            <h4 className="font-bold text-[var(--foreground)] line-clamp-1 text-sm">
              {formData.name || 'Nome do restaurante'}
            </h4>

            {formData.location && (
              <div className="flex items-center gap-1 mt-1 text-xs text-[var(--foreground-muted)]">
                <MapPin className="w-3 h-3" />
                {formData.location}
              </div>
            )}

            {formData.description && (
              <p className="text-xs text-[var(--foreground-secondary)] line-clamp-2 mt-2">
                {formData.description}
              </p>
            )}

            {formData.selectedCuisineTypes.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.selectedCuisineTypes.slice(0, 3).map((cuisine) => (
                  <span key={cuisine} className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400">
                    {cuisine}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tips */}
        <div className="mt-3 p-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
          <p className="text-[10px] text-amber-400/80">
            💡 Dica: Quanto mais informações adicionares, mais atrativo será o teu restaurante!
          </p>
        </div>
      </div>
    </motion.div>
  );
}
