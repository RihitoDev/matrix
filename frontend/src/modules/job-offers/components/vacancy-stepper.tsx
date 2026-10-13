
import { Check } from "lucide-react";

interface VacancyStepperProps {
    currentStep:number;
}

type CircleState = "done" | "active" | "pending";

function StepCircle({ number, state }: { number: number; state: CircleState }) {
  if (state === "pending") {
    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border-strong text-xs font-bold text-text-secondary">
        {number}
      </span>
    );
  }
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-bold text-white">
      {state === "done" ? <Check className="h-3.5 w-3.5" /> : number}
    </span>
  );
}

function StepLine({ filled }: { filled: boolean }) {
  return <div className={filled ? "h-0.5 flex-1 bg-ink" : "h-0.5 flex-1 bg-border-strong"} />;
}

function StepWithLabel({ number, label, state,
}: {
  number: number; label: string; state: CircleState;
}) {
  return (
    <div className="relative flex flex-col items-center">
      <StepCircle number={number} state={state} />
      <span
        className={
          "absolute top-full mt-2 whitespace-nowrap text-center text-xs font-semibold " +
          (state === "pending" ? "text-text-secondary" : "text-ink")
        }
      >
        {label}
      </span>
    </div>
  );
}

export function VacancyStepper({ currentStep }: VacancyStepperProps) {
  const state1: CircleState = currentStep > 1 ? "done" : currentStep === 1 ? "active" : "pending";
  const state2: CircleState = currentStep > 2 ? "done" : currentStep === 2 ? "active" : "pending";
  const state3: CircleState = currentStep === 3 ? "active" : "pending";

  return (
    <div className="mt-6 flex items-center px-25 pb-8">
      <StepWithLabel number={1} label="Informacion y condiciones" state={state1} />
      <StepLine filled={currentStep > 1} />
      <StepWithLabel number={2} label="Descripcion y requisitos" state={state2} />
      <StepLine filled={currentStep > 2} />
      <StepWithLabel number={3} label="Vista previa" state={state3} />
    </div>
  );
}