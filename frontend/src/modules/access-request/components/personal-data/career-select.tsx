"use client";

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SELECT_ITEM_CONTRAST_CLASS } from "@/shared/constants/select.constants";
import { CAREERS } from "../../constants/careers.constants";
import { useAccessRequestForm } from "../../contexts/access-request-context";
import { FieldError } from "./field-error";
import { RequiredMark } from "./required-mark";

export function CareerSelect() {
  const { values, fieldErrors, setValue } = useAccessRequestForm();

  return (
    <div className="md:col-span-2">
      <Label htmlFor="career" className="mb-1.5 text-[12.5px] font-semibold text-ink 2xl:text-base">
        Carrera
        <RequiredMark />
      </Label>
      <Select
        name="career"
        value={values.career || null}
        onValueChange={(value) => setValue("career", value ?? "")}
      >
        <SelectTrigger
          id="career"
          aria-required="true"
          aria-invalid={fieldErrors.career ? true : undefined}
          aria-describedby={fieldErrors.career ? "career-error" : undefined}
          className="w-full rounded-md border-border bg-surface px-3 text-[15px] text-ink focus-visible:border-accent focus-visible:ring-interaction data-[size=default]:h-[42px] 2xl:text-base 2xl:data-[size=default]:h-12"
        >
          <SelectValue placeholder="Selecciona tu carrera" />
        </SelectTrigger>
        <SelectContent>
          {CAREERS.map((career) => (
            <SelectItem
              key={career}
              value={career}
              className={SELECT_ITEM_CONTRAST_CLASS}
            >
              {career}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldError id="career-error" message={fieldErrors.career} />
    </div>
  );
}
