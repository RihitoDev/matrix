import { Check, Circle } from "lucide-react";
import { JOB_MATCHING_MESSAGES } from "../constants/job-matching.constants";
import type { JobRequirement } from "../types/job-matching.types";

interface MissingRequirementsProps {
  requirements: JobRequirement[];
  title?: string;
}

export function MissingRequirements({
  requirements,
  title = JOB_MATCHING_MESSAGES.requirementsTitle,
}: MissingRequirementsProps) {
  const hasPending = requirements.some(({ status }) => status === "Pendiente");

  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      {!hasPending && (
        <p role="status" className="text-sm text-ink-soft">
          {JOB_MATCHING_MESSAGES.noPendingRequirements}
        </p>
      )}
      {requirements.length > 0 && (
        <ul className="flex flex-col">
          {requirements.map(({ name, status }) => (
            <li
              key={name}
              className="flex items-center justify-between gap-3 border-b border-border py-2 text-sm last:border-b-0"
            >
              <span className="text-ink">{name}</span>
              {status === "Cumple" ? (
                <span className="flex items-center gap-1.5 font-semibold text-ink">
                  <Check className="size-4" aria-hidden="true" />
                  Cumple
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-text-secondary">
                  <Circle className="size-4" aria-hidden="true" />
                  Pendiente
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
