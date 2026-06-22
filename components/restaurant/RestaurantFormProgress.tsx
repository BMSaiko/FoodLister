'use client';

import { motion } from 'motion/react';
import { Check, Info, Tag, Utensils, MapPin, Image } from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Básico', icon: Info },
  { id: 2, label: 'Categorias', icon: Tag },
  { id: 3, label: 'Dietética', icon: Utensils },
  { id: 4, label: 'Características', icon: MapPin },
  { id: 5, label: 'Imagens', icon: Image },
  { id: 6, label: 'Detalhes', icon: Check },
];

interface RestaurantFormProgressProps {
  currentStep: number;
  onStepClick: (step: number) => void;
}

export default function RestaurantFormProgress({ currentStep, onStepClick }: RestaurantFormProgressProps) {
  return (
    <div className="mb-8">
      <div className="h-1 bg-white/[0.06] rounded-full mb-6 overflow-hidden">
        <motion.div
          className="h-full bg-[var(--primary)] rounded-full progress-glow"
          initial={{ width: '0%' }}
          animate={{ width: ((currentStep - 1) / (STEPS.length - 1)) * 100 + '%' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      <div className="flex justify-between">
        {STEPS.map((step) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          const Icon = step.icon;

          let labelClass = 'text-[var(--foreground-muted)]';
          if (isActive) labelClass = 'text-[var(--primary)]';
          if (isCompleted) labelClass = 'text-emerald-400';

          return (
            <button
              key={step.id}
              onClick={() => onStepClick(step.id)}
              className="flex flex-col items-center gap-1.5 group"
            >
              <motion.div
                className={
                  'w-10 h-10 rounded-full flex items-center justify-center transition-colors ' +
                  (isActive
                    ? 'bg-[var(--primary)] text-black'
                    : isCompleted
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-white/[0.03] border border-white/[0.08] text-[var(--foreground-muted)]')
                }
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </motion.div>
              <span className={'text-xs font-medium hidden sm:block ' + labelClass}>
                {step.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
