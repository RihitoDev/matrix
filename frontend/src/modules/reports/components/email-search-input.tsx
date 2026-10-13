import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { EmailSearchInputProps } from "../types/email-search-input-props.types";

export function EmailSearchInput({ value, onChange }: EmailSearchInputProps) {
  return (
    <div className="relative w-full sm:w-96">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-secondary"
        aria-hidden="true"
      />
      <Input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Buscar por correo electrónico"
        aria-label="Buscar por correo electrónico"
        maxLength={100}
        className="h-auto rounded-md border-border bg-surface py-2.5 pl-10 pr-10 text-sm text-ink placeholder:text-text-secondary focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-interaction"
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => onChange("")}
          aria-label="Limpiar búsqueda"
          className="absolute right-1 top-1/2 size-8 -translate-y-1/2 rounded-md text-text-secondary hover:bg-transparent hover:text-ink"
        >
          <X className="size-4" aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}
