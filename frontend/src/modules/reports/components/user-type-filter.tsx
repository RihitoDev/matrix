"use client";

import { useId } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ALL_USER_TYPES_VALUE, USER_TYPE_SELECT_OPTIONS } from "../constants/registered-users.constants";
import type { RoleTag } from "@/modules/auth/types/auth-types";
import type { UserTypeFilterProps } from "../types/user-type-filter-props.types";

export function UserTypeFilter({ value, onChange }: UserTypeFilterProps) {
  const labelId = useId();

  const handleValueChange = (selectedValue: string | null) => {
    onChange(!selectedValue || selectedValue === ALL_USER_TYPES_VALUE ? undefined : (selectedValue as RoleTag));
  };

  return (
    <div className="w-full sm:w-72">
      <Select items={USER_TYPE_SELECT_OPTIONS} value={value ?? ALL_USER_TYPES_VALUE} onValueChange={handleValueChange}>
        <SelectTrigger
          aria-labelledby={labelId}
          className="w-full cursor-pointer rounded-md border-border bg-surface px-3 pb-2 pt-1.5 hover:border-ink-soft hover:bg-surface-soft focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-interaction data-[size=default]:h-auto data-popup-open:border-accent data-popup-open:ring-3 data-popup-open:ring-interaction"
        >
          <span className="flex flex-1 flex-col items-start">
            <span id={labelId} className="text-xs text-text-secondary">
              Tipo de usuario
            </span>
            <SelectValue className="text-sm text-ink" />
          </span>
        </SelectTrigger>

        <SelectContent alignItemWithTrigger={false} className="rounded-md bg-surface py-1 ring-border">
          {USER_TYPE_SELECT_OPTIONS.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="rounded-none px-3 py-2 text-ink-soft focus:bg-surface-soft focus:text-ink data-selected:font-semibold data-selected:text-ink"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
