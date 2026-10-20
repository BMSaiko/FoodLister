'use client';

import React from 'react';
import { Check, ChevronLeft, ChevronRight, Save } from 'lucide-react';

export interface WizardStep {
  id: number;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface FormStepperProps {
  steps: WizardStep[];
  currentStep: number;
  onStepClick: (step: number) => void;
}

export function FormStepper({ steps, currentStep, onStepClick }: FormStepperProps) {
  const current = steps.find((s) => s.id === currentStep);

  return (
    <div className="mb-6">
      <p className="text-sm font-medium text-[var(--foreground)] mb-3" aria-live="polite">
        {`Passo ${currentStep} de ${steps.length} · ${current?.label ?? ''}`}
      </p>
      <div className="h-1 bg-white/[0.06] rounded-full mb-3 overflow-hidden" aria-hidden="true">
        <div
          className="h-full bg-[var(--primary)] rounded-full transition-[width] duration-500"
          style={{ width: `${((currentStep - 1) / Math.max(steps.length - 1, 1)) * 100}%` }}
        />
      </div>
      <div className="flex justify-between">
        {steps.map((step) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          const Icon = step.icon;
          const tone = isActive
            ? 'bg-[var(--primary)] text-black'
            : isCompleted
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'bg-white/[0.03] border border-white/[0.08] text-[var(--foreground-muted)]';

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onStepClick(step.id)}
              aria-current={isActive ? 'step' : undefined}
              aria-label={`Passo ${step.id}: ${step.label}`}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <span className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${tone}`}>
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : Icon ? (
                  <Icon className="w-4 h-4" />
                ) : (
                  <span className="text-sm font-semibold">{step.id}</span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface WizardNavProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onCancel?: () => void;
  submitLabel: string;
  saving?: boolean;
}

/** Barra de ações fixa acima da barra inferior em mobile; inline em md+. */
export function WizardNav({ currentStep, totalSteps, onPrevious, onNext, onCancel, submitLabel, saving }: WizardNavProps) {
  const isLast = currentStep === totalSteps;
  const ghost =
    'inline-flex items-center justify-center gap-2 min-h-[44px] px-4 text-sm font-medium text-[var(--foreground-secondary)] hover:text-[var(--foreground)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors';
  const primary =
    'inline-flex items-center justify-center gap-2 min-h-[44px] px-5 bg-[var(--primary)] text-black text-sm font-semibold rounded-full hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50';

  return (
    <div className="fixed inset-x-0 z-30 border-t border-white/[0.08] bg-[var(--background)] px-4 py-2.5 bottom-[calc(var(--bottom-nav-h)+env(safe-area-inset-bottom))] md:static md:z-auto md:border-0 md:bg-transparent md:p-0 md:pt-4">
      <div className="flex items-center justify-between gap-2 max-w-3xl mx-auto md:max-w-none">
        <div className="flex items-center">
          {onCancel && (
            <button type="button" onClick={onCancel} className={ghost}>
              Cancelar
            </button>
          )}
          <button type="button" onClick={onPrevious} disabled={currentStep === 1} className={ghost}>
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>
        </div>
        {/* keys distintas: sem elas o React reaproveita o nó e o clique em «Seguinte» submete */}
        {isLast ? (
          <button key="submit" type="submit" disabled={saving} className={primary}>
            <Save className="w-4 h-4" />
            {saving ? 'A guardar...' : submitLabel}
          </button>
        ) : (
          <button key="next" type="button" onClick={onNext} className={primary}>
            Seguinte
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
