import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ExportCsvButtonProps } from "../types/export-csv-button-props.types";

export function ExportCsvButton({ onClick, isExporting = false }: ExportCsvButtonProps) {
  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={isExporting}
      aria-busy={isExporting}
      className="relative h-auto gap-2 overflow-hidden rounded-md bg-ink py-2.5 pl-5 pr-4 text-sm font-semibold text-surface before:absolute before:inset-y-0 before:left-0 before:w-1.5 before:bg-accent hover:bg-ink-soft"
    >
      <FileText className="size-5" strokeWidth={1.5} aria-hidden="true" />
      {isExporting ? "Exportando..." : "Exportar CSV"}
    </Button>
  );
}
