import { BookOpen } from "lucide-react";
import type { AreaCourseListProps } from "../types/area-detail-components.types";
import { AreaEmptyState } from "./area-empty-state";

export function AreaCourseList({ courses }: AreaCourseListProps) {
  return (
    <div className="min-w-0">
      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-ink-soft">
        <BookOpen className="size-3.5 shrink-0 text-accent" aria-hidden="true" />
        Cursos
      </p>
      {courses.length === 0 ? (
        <AreaEmptyState />
      ) : (
        <ul aria-label="Cursos" className="flex flex-col divide-y divide-border">
          {courses.map((course) => (
            <li
              key={course.id}
              className="flex min-w-0 items-start justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
            >
              <div className="min-w-0 break-words">
                <p className="text-sm font-medium text-ink">{course.name}</p>
                <p className="text-xs text-text-secondary">{course.institution}</p>
              </div>
              <span className="shrink-0 rounded-full bg-surface-soft px-2 py-0.5 text-[11px] font-medium text-ink-soft tabular-nums">
                {course.year}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
