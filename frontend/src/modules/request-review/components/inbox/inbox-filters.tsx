"use client";

import { Calendar, ListFilter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SELECT_ITEM_CONTRAST_CLASS, SELECT_POPUP_WIDE_CLASS } from "@/shared/constants/select.constants";
import { CAREER_OPTIONS, PERIOD_OPTIONS } from "../../constants/inbox-filters.constants";
import type { InboxFiltersProps } from "../../types/inbox-filters-props.types";
import type { InboxPeriod } from "../../types/inbox-filters.types";

const TRIGGER_CLASS =
  "w-full gap-2 rounded-lg border-border bg-surface px-3 text-[14.5px] font-medium text-ink focus-visible:border-accent focus-visible:ring-interaction data-[size=default]:h-[42px] md:w-auto md:max-w-[300px]";
const SR_ONLY = "sr-only";

export function InboxFilters({ search, career, period, onSearchChange, onCareerChange, onPeriodChange }: InboxFiltersProps) {
  return (
    <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
      <div className="relative w-full md:w-[290px]">
        <Label htmlFor="inbox-search" className={SR_ONLY}>
          Buscar por nombre, C.I. o código SIS
        </Label>
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-secondary" strokeWidth={1.75} aria-hidden="true" />
        <Input
          id="inbox-search"
          type="search"
          value={search}
          maxLength={100}
          autoComplete="off"
          placeholder="Nombre, CI o código SIS"
          onChange={(event) => onSearchChange(event.target.value)}
          className="h-[42px] rounded-lg border-border bg-surface pl-9 pr-3 text-[14.5px] text-ink focus-visible:border-accent focus-visible:ring-interaction"
        />
      </div>

      <div>
        <Label htmlFor="inbox-career" className={SR_ONLY}>
          Carrera
        </Label>
        <Select items={CAREER_OPTIONS} value={career} onValueChange={(value) => onCareerChange(value ?? "all")}>
          <SelectTrigger id="inbox-career" title={CAREER_OPTIONS.find((option) => option.value === career)?.label} className={TRIGGER_CLASS}>
            <ListFilter className="size-4 text-text-secondary" strokeWidth={1.75} aria-hidden="true" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent className={SELECT_POPUP_WIDE_CLASS}>
            {CAREER_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value} className={SELECT_ITEM_CONTRAST_CLASS}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="inbox-period" className={SR_ONLY}>
          Período
        </Label>
        <Select items={PERIOD_OPTIONS} value={period} onValueChange={(value) => onPeriodChange((value ?? "all") as InboxPeriod)}>
          <SelectTrigger id="inbox-period" title={PERIOD_OPTIONS.find((option) => option.value === period)?.label} className={TRIGGER_CLASS}>
            <Calendar className="size-4 text-text-secondary" strokeWidth={1.75} aria-hidden="true" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent className={SELECT_POPUP_WIDE_CLASS}>
            {PERIOD_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value} className={SELECT_ITEM_CONTRAST_CLASS}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
