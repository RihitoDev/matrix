"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TIME_OPTIONS, TIME_PLACEHOLDER } from "../constants/availability.constants";
import type { TimeSelectProps } from "../types/time-select-props.types";

export function TimeSelect({ id, value, onValueChange, invalid, describedBy, disabled }: TimeSelectProps) {
  return (
    <Select name={id} value={value || null} disabled={disabled} onValueChange={(nextValue) => onValueChange(nextValue ?? "")}>
      <SelectTrigger id={id} aria-invalid={invalid || undefined} aria-describedby={describedBy} className="h-10 w-full">
        <SelectValue placeholder={TIME_PLACEHOLDER} />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false} className="max-h-[min(200px,var(--available-height))]">
        {TIME_OPTIONS.map((time) => (
          <SelectItem key={time} value={time}>{time}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
