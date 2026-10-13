import { CircleSlash } from "lucide-react";

export function AreaEmptyState() {
  return (
    <p className="flex items-center gap-1.5 text-xs text-text-secondary italic">
      <CircleSlash className="size-3.5 shrink-0 text-border-strong" aria-hidden="true" />
      Sin información registrada
    </p>
  );
}
