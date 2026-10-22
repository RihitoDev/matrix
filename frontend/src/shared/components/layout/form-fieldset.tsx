import { cn } from "cn";
import type { FormSectionProps } from "@/shared/types/form-section-props.types";

export function FormFieldset({ title, description, children, className }: FormSectionProps) {
  return (
    <fieldset className={cn("min-w-0 border-0 border-b border-border pb-5 last:border-0", className)}>
      <legend className="mb-4 text-sm font-semibold text-ink">{title}</legend>
      {description ? <p className="mb-4 text-sm text-text-secondary">{description}</p> : null}
      <div className="space-y-5">{children}</div>
    </fieldset>
  );
}
