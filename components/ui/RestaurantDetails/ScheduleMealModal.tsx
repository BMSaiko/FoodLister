"use client";

import React, { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { toast } from "react-toastify";
import { DEFAULT_MEAL_TYPES } from "@/hooks/forms/useMealScheduling";
import { useAuth } from "@/contexts";
import { useRouter } from "next/navigation";
import MealDetailsStep from "./steps/MealDetailsStep";
import ParticipantsStep from "./steps/ParticipantsStep";
import ConfirmStep from "./steps/ConfirmStep";

interface ScheduleMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantName: string;
  restaurantId?: string;
}

export default function ScheduleMealModal({
  isOpen,
  onClose,
  restaurantName,
  restaurantId,
}: ScheduleMealModalProps) {
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Details
  const [date, setDate] = useState("");
  const [time, setTime] = useState("19:00");
  const [duration, setDuration] = useState(90);
  const [mealType, setMealType] = useState("jantar");

  // Step 2: Participants
  const [participants, setParticipants] = useState<any[]>([]);

  // Step 3: Confirm
  const [googleCalendar, setGoogleCalendar] = useState(false);

  const { user } = useAuth();
  const router = useRouter();

  const totalSteps = 3;

  const canProceed = useCallback(() => {
    if (currentStep === 1) return date.length > 0 && time.length > 0;
    if (currentStep === 2) return participants.length >= 0; // Allow solo meals
    return true;
  }, [currentStep, date, time, participants]);

  const goNext = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const goBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!restaurantId || !date || !time) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const participantIds = participants.map((p: any) => p.user_id);
      const payload: any = {
        restaurantId,
        mealDate: date,
        mealTime: time,
        mealType,
        durationMinutes: duration,
        participantUserIds: participantIds,
      };
      if (googleCalendar) {
        payload.googleCalendar = true;
      }

      const response = await fetch("/api/meals/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("Schedule API response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Erro ao agendar refeição");
      }

      // Success: show toast notification
      toast.success("Refeição agendada com sucesso!", {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        theme: "dark",
      });

      onClose();
      if (data.id) router.push(`/meals/${data.id}`);
    } catch (err: any) {
      const errorMsg = err.message || "Erro ao agendar refeição";
      setSubmitError(errorMsg);
      toast.error(errorMsg, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        theme: "dark",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="md"
      ariaLabel="Agendar refeicao"
    >
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 pt-2 pb-1">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <div
            key={step}
            className={"w-2 h-2 rounded-full transition-colors duration-200 " +
              (step === currentStep ? "bg-amber-500" :
               step < currentStep ? "bg-amber-500/40" : "bg-white/10")}
          />
        ))}
      </div>

      {/* Step title */}
      <div className="px-5 pt-3 pb-4 border-b border-white/0.06">
        <h2 className="text-base font-medium text-white/90">
          {currentStep === 1 && "Detalhes da refeicao"}
          {currentStep === 2 && "Participantes"}
          {currentStep === 3 && "Confirmar"}
        </h2>
      </div>

      {/* Step content */}
      <div className="px-5 py-4 overflow-y-auto overscroll-contain" style={{ maxHeight: "min(50vh, 360px)" }}>
        {currentStep === 1 && (
          <MealDetailsStep
            date={date}
            time={time}
            duration={duration}
            mealType={mealType}
            mealTypes={DEFAULT_MEAL_TYPES}
            onChange={(field, value) => {
              if (field === "date") setDate(value as string);
              else if (field === "time") setTime(value as string);
              else if (field === "duration") setDuration(value as number);
              else if (field === "mealType") setMealType(value as string);
            }}
          />
        )}
        {currentStep === 2 && (
          <ParticipantsStep
            participants={participants}
            onAdd={(user) => setParticipants([...participants, user])}
            onRemove={(id) => setParticipants(participants.filter((p: any) => p.id !== id))}
            currentUserId={user?.id ?? ""}
          />
        )}
        {currentStep === 3 && (
          <ConfirmStep
            restaurantName={restaurantName}
            date={date}
            time={time}
            duration={duration}
            mealType={mealType}
            participantCount={participants.length}
            googleCalendar={googleCalendar}
            onToggleCalendar={() => setGoogleCalendar(!googleCalendar)}
          />
        )}
      </div>

      {/* Error message */}
      {submitError && (
        <div className="px-5 py-2 bg-red-500/10 border border-red-500/20 rounded-xl mb-3">
          <p className="text-xs text-red-400">{submitError}</p>
        </div>
      )}

      {/* Navigation */}
      <div className="px-5 py-4 border-t border-white/0.06 flex gap-3">
        {currentStep > 1 && (
          <button
            onClick={goBack}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white/80 transition-colors bg-white/0.04 hover:bg-white/0.06"
          >
            <ChevronLeft className="h-4 w-4" />
            Voltar
          </button>
        )}
        <button
          onClick={currentStep === totalSteps ? handleSubmit : goNext}
          disabled={!canProceed() || submitting}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors bg-amber-500 text-black hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {currentStep === totalSteps ? (submitting ? "A agendar..." : "Agendar") : "Proximo"}
          {currentStep < totalSteps && <ChevronRight className="h-4 w-4" />}
        </button>
      </div>
    </Modal>
  );
}
