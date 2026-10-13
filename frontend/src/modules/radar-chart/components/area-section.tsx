import type { AreaSectionProps } from "../types/area-detail-components.types";

export function AreaSection({ title, icon: Icon, count, children }: AreaSectionProps) {
  return (
    <div className="flex min-w-0 flex-col gap-4 p-6">
      <div className="flex min-w-0 items-center gap-2 text-ink-soft">
        <Icon className="size-4 shrink-0" aria-hidden="true" />
        <h3 className="min-w-0 text-xs font-semibold tracking-[0.12em] break-words uppercase">
          {title}
        </h3>
        <span className="rounded-full bg-surface-soft px-1.5 py-0.5 text-[11px] leading-none font-medium text-text-secondary tabular-nums">
          {count}
        </span>
      </div>
      {children}
    </div>
  );
}
