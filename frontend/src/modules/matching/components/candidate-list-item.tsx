"use client";

import { cn } from "@/lib/utils";
import { getInitials } from "@/shared/utils/get-initials";
import type { CandidateWithMatch } from "../types/matching-types";

interface CandidateListItemProps {
  candidate: CandidateWithMatch;
  selected: boolean;
  onSelect: (id: string) => void;
}

export function CandidateListItem({ candidate, selected, onSelect }: CandidateListItemProps) {
  const isDiscarded = candidate.status === "discarded";

  return (
    <button
      type="button"
      onClick={() => onSelect(candidate.id)}
      aria-pressed={selected}
      className={cn(
        "w-full rounded-lg border p-3 text-left transition-colors",
        selected ? "border-primary bg-muted" : "border-border bg-background hover:bg-muted/60",
        isDiscarded && "opacity-60"
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
          {getInitials(candidate.name)}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-medium text-foreground">{candidate.name}</p>
            <span className="shrink-0 text-sm font-semibold text-foreground">
              {candidate.matchPercent}%
            </span>
          </div>
          <p className="truncate text-xs text-muted-foreground">{candidate.role}</p>

          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${candidate.matchPercent}%` }}
            />
          </div>

          <div className="mt-2 flex flex-wrap gap-1">
            {candidate.technologies.map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground"
              >
                {tech}
              </span>
            ))}
            {isDiscarded && (
              <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive">
                Descartado
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
