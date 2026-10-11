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
      <ol className="flex flex-col gap-4 sm:grid sm:grid-cols-4 sm:gap-2">
        {MENTORSHIP_STEPS.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          const isLast = index === MENTORSHIP_STEPS.length - 1;

          return (
            <li
              key={step.id}
              className="relative flex items-start gap-3 sm:flex-col sm:items-center sm:text-center"
            >
              <div
                className={[
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors",
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
                    "block text-xs font-semibold leading-tight",
                    isActive || isCompleted ? "text-ink" : "text-text-secondary",
                  ].join(" ")}
                >
                  {step.label}
                </span>
              </div>

              {!isLast && (
                <div
                  className="absolute left-[18px] top-9 hidden h-[calc(100%-2.25rem)] w-0.5 bg-slate-200 sm:left-auto sm:right-[-50%] sm:top-[18px] sm:h-0.5 sm:w-[calc(100%-2.25rem)]"
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
