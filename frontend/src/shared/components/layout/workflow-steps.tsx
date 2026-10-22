import { Check } from "lucide-react";
import { cn } from "cn";
import type { WorkflowStepsProps } from "@/shared/types/workflow-steps-props.types";

export function WorkflowSteps({ steps, currentStep, label }: WorkflowStepsProps) {
  return (
    <nav aria-label={label}>
      <ol className="flex flex-wrap gap-3 rounded-lg border border-border bg-surface p-4">
        {steps.map((step) => (
          <li key={step.id} aria-current={step.id === currentStep ? "step" : undefined} className={cn("flex min-w-0 flex-1 items-center gap-3 rounded-md px-3 py-2 text-sm", step.id === currentStep ? "bg-interaction font-semibold text-accent" : "text-text-secondary")}>
            <span aria-hidden="true" className={cn("flex size-7 shrink-0 items-center justify-center rounded-md text-xs font-semibold", step.id <= currentStep ? "bg-accent text-surface" : "bg-surface-soft text-text-secondary")}>
              {step.id < currentStep ? <Check className="size-4" aria-hidden="true" /> : step.id}
            </span>
            <span>{step.label}</span>
          </li>
        ))}
      </ol>
    </nav>
  );
}
