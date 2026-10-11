import Link from "next/link";
import { cn } from "@/lib/utils";
import { TRAJECTORY_STEPS } from "../config/trajectory-steps.config";
import type { TrajectoryStepsProps } from "../types/trajectory-steps-props.types";

export function TrajectorySteps({ activeStep = "education" }: TrajectoryStepsProps) {
  return (
    <ol aria-label="Sub-secciones de trayectoria" className="mb-8 flex gap-10">
      {TRAJECTORY_STEPS.map((step) => {
        const isActive = step.id === activeStep;

        return (
          <li
            key={step.id}
            aria-current={isActive ? "step" : undefined}
            className={cn(
              "text-[15px]",
              isActive ? "font-semibold text-ink" : "text-text-secondary",
            )}
          >
            <Link
              href={step.href}
              className="flex items-center gap-3 transition-colors hover:text-ink"
            >
              <span
                className={cn(
                  "font-tight text-[20px] font-bold",
                  isActive ? "text-accent" : "text-border-strong",
                )}
              >
                {step.number}
              </span>
              <span>{step.label}</span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
