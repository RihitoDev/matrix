import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "./field-error";
import { RequiredMark } from "./required-mark";
import type { PersonalDataFieldProps } from "../../types/personal-data-field-props.types";

export function PersonalDataField({
  id,
  label,
  help,
  icon,
  isRequired = false,
  error,
  className,
  ...inputProps
}: PersonalDataFieldProps) {
  const helpId = help ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={className}>
      <Label htmlFor={id} className="mb-1.5 text-[12.5px] font-semibold text-ink 2xl:text-base">
        {label}
        {isRequired ? <RequiredMark /> : null}
      </Label>
      <div className="relative">
        {icon ? (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-text-secondary">
            {icon}
          </span>
        ) : null}
        <Input
          id={id}
          name={id}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          aria-required={isRequired || undefined}
          className={`h-[42px] rounded-md border-border bg-surface text-[15px] text-ink focus-visible:border-accent focus-visible:ring-interaction md:text-[15px] 2xl:h-12 2xl:text-base ${
            icon ? "pl-10" : "px-3"
          }`}
          {...inputProps}
        />
      </div>
      {help ? (
        <p id={helpId} className="mt-1.5 text-[12.5px] text-text-secondary 2xl:text-base">
          {help}
        </p>
      ) : null}
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}
