import type { AreaTagsProps } from "../types/area-detail-components.types";
import { AreaEmptyState } from "./area-empty-state";

export function AreaTags({ tags }: AreaTagsProps) {
  if (tags.length === 0) {
    return <AreaEmptyState />;
  }

  return (
    <ul aria-label="Etiquetas" className="flex min-w-0 flex-wrap gap-1.5">
      {tags.map((tag) => (
        <li
          key={tag}
          className="max-w-full rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium break-words text-ink-soft hover:border-border-strong motion-safe:transition-colors"
        >
          {tag}
        </li>
      ))}
    </ul>
  );
}
