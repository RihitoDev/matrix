import type { AreaExperienceTimelineProps } from "../types/area-detail-components.types";
import { formatDurationYears } from "../utils/format-duration-years";
import { AreaEmptyState } from "./area-empty-state";

export function AreaExperienceTimeline({ experience }: AreaExperienceTimelineProps) {
  if (experience.length === 0) {
    return <AreaEmptyState />;
  }

  return (
    <ol aria-label="Experiencia" className="flex flex-col gap-5">
      {experience.map((item, index) => (
        <li key={item.id} className="relative min-w-0 pl-6">
          {index < experience.length - 1 && (
            <span
              className="absolute top-2 -bottom-7 left-[3px] w-px bg-border-strong"
              data-testid="experience-connector"
              aria-hidden="true"
            />
          )}
          <span
            className="absolute top-1.5 left-0 size-2 rounded-full bg-accent ring-2 ring-surface"
            aria-hidden="true"
          />
          <p className="text-sm font-semibold break-words text-ink">{item.role}</p>
          <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <span className="min-w-0 text-xs break-words text-ink-soft">{item.company}</span>
            <span className="rounded-full bg-surface-soft px-2 py-0.5 text-[11px] font-medium whitespace-nowrap text-ink-soft tabular-nums">
              {formatDurationYears(item.durationYears)}
            </span>
          </div>
          {item.description && (
            <p className="mt-1.5 text-xs leading-relaxed break-words text-text-secondary">
              {item.description}
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}
