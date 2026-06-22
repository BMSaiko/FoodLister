"use client";

import { motion } from "motion/react";
import { Check, Info, Globe, Search, List, Eye, Sparkles } from "lucide-react";

const STEPS = [
  { id: 1, label: "Info", icon: Info },
  { id: 2, label: "Visibilidade", icon: Globe },
  { id: 3, label: "Restaurantes", icon: Search },
  { id: 4, label: "Organizar", icon: List },
  { id: 5, label: "Preview", icon: Eye },
  { id: 6, label: "Criar", icon: Sparkles },
];

interface ListFormProgressProps {
  currentStep: number;
  onStepClick: (step: number) => void;
}

export default function ListFormProgress({ currentStep, onStepClick }: ListFormProgressProps) {
  return (
    <div className="mb-8">
      <div className="h-1 bg-white/[0.06] rounded-full mb-5 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: ((currentStep - 1) / (STEPS.length - 1)) * 100 + "%" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      <div className="flex justify-between">
        {STEPS.map(step => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          const Icon = step.icon;

          return (
            <button
              key={step.id}
              onClick={() => onStepClick(step.id)}
              className="flex flex-col items-center gap-1.5 group"
            >
              <motion.div
                className={
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 " +
                  (isActive
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/20"
                    : isCompleted
                    ? "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/25"
                    : "bg-white/[0.03] border border-white/[0.06] text-white/30")
                }
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </motion.div>
              <span className={
                "text-[10px] font-semibold uppercase tracking-wider hidden sm:block transition-colors duration-200 " +
                (isActive ? "text-purple-400" : isCompleted ? "text-emerald-400" : "text-white/25")
              }>
                {step.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
