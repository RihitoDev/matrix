"use client";

import { ChevronDown, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ACADEMIC_PERIODS } from "../constants/reports.constants";

export function ManagementMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            className="group h-auto gap-2 rounded-md bg-ink px-4 py-2.5 text-sm font-semibold text-surface hover:bg-ink-soft aria-expanded:bg-ink-soft aria-expanded:text-surface"
          />
        }
      >
        <Settings className="size-5" strokeWidth={1.5} aria-hidden="true" />
        Gestión
        <ChevronDown className="size-4 transition-transform group-aria-expanded:rotate-180" aria-hidden="true" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-40 rounded-md bg-surface py-1 text-ink-soft ring-border">
        {ACADEMIC_PERIODS.map((period) => (
          <DropdownMenuItem
            key={period}
            className="rounded-none px-4 py-2 text-sm text-ink-soft focus:bg-surface-soft focus:text-ink"
          >
            {period}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
