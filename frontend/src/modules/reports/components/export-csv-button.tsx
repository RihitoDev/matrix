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
      className="h-10 gap-2 rounded-md bg-accent px-4 text-sm font-semibold text-surface hover:bg-brand-hover"
    >
      <FileText className="size-5" strokeWidth={1.5} aria-hidden="true" />
      {isExporting ? "Exportando..." : "Exportar CSV"}
    </Button>
  );
}
