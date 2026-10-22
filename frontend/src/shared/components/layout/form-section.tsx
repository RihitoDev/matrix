import { cn } from "cn";
import type { FormSectionProps } from "@/shared/types/form-section-props.types";

export function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <section aria-label={title} className={cn("@container/form-section min-w-0 border-b border-border py-6 first:pt-0 last:border-0", className)}>
      <div className="grid gap-5 @min-[42rem]/form-section:grid-cols-[180px_minmax(0,1fr)] @min-[42rem]/form-section:gap-8">
      <header className="min-w-0">
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        {description ? <p className="mt-2 max-w-prose text-sm leading-relaxed text-text-secondary">{description}</p> : null}
      </header>
      <div className="min-w-0 space-y-5">{children}</div>
      </div>
    </section>
  );
}
