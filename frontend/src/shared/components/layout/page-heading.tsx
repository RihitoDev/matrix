import { cn } from "cn";
import type { PageHeadingProps } from "@/shared/types/page-heading-props.types";

export function PageHeading({ title, description, actions, className }: PageHeadingProps) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-4", className)}>
      <div className="min-w-0 max-w-3xl">
        <h1 className="font-tight text-3xl font-bold leading-tight tracking-tight text-ink">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-[70ch] text-sm leading-relaxed text-text-secondary">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}
