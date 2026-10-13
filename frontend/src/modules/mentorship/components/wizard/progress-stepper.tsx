"use client";

import { Check } from "lucide-react";
import { MENTORSHIP_STEPS } from "../../constants/mentorship-steps.constants";
import type { MentorshipStep } from "../../types/mentorship-step.types";

type ProgressStepperProps = {
  currentStep: MentorshipStep;
};

export function ProgressStepper({ currentStep }: ProgressStepperProps) {
  return (
    <nav aria-label="Progreso de configuración de mentoría">
      <ol className="grid grid-cols-4 gap-1 sm:gap-3">
        {MENTORSHIP_STEPS.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          const isLast = index === MENTORSHIP_STEPS.length - 1;

          return (
            <li
              key={step.id}
              className="relative flex min-w-0 flex-col items-center gap-2 text-center"
            >
              <div
                className={[
                  "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors sm:h-9 sm:w-9 sm:text-sm",
                  isCompleted
                    ? "bg-accent text-white"
                    : isActive
                      ? "bg-accent text-white ring-4 ring-accent/20"
                      : "bg-slate-200 text-slate-600",
                ].join(" ")}
                aria-current={isActive ? "step" : undefined}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" strokeWidth={3} aria-hidden />
                ) : (
                  step.id
                )}
              </div>

              <div className="min-w-0 flex-1 pt-1 sm:pt-0">
                <span
                  className={[
                    "w-full break-words text-[10px] leading-tight sm:text-xs sm:leading-snug",
                    isActive || isCompleted ? "text-ink" : "text-text-secondary",
                  ].join(" ")}
                >
                  {step.label}
                </span>
              </div>

              {!isLast && (
                <div
                  className={[
                    "absolute left-[calc(50%+1rem)] right-[calc(-50%+1rem)] top-4 z-0 h-0.5",
                    isCompleted ? "bg-accent" : "bg-slate-200",
                  ].join(" ")}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
