import { FileText, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CertificationCardProps } from "../types/certification-card-props.types";
import { formatIssueDate } from "../utils/format-issue-date";

export function CertificationCard({
  certification,
  isBusy = false,
  onEdit,
  onDelete,
  onViewDocument,
}: CertificationCardProps) {
  return (
    <article className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <h4 className="break-words text-[15px] font-bold text-ink [overflow-wrap:anywhere]">{certification.name}</h4>
        <p className="mt-0.5 break-words text-[13px] text-text-secondary [overflow-wrap:anywhere]">
          {certification.issuingOrganization} · Obtenida el{" "}
          <time dateTime={certification.issueDate}>{formatIssueDate(certification.issueDate)}</time>
        </p>
        <div className="mt-2">
          {certification.hasDocument === true ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-label={`Previsualizar documento de ${certification.name}`}
              disabled={isBusy}
              onClick={() => onViewDocument(certification)}
              className="h-7 border-border-strong bg-surface px-2.5 text-[12px] font-semibold text-ink hover:bg-surface-soft"
            >
              <FileText aria-hidden="true" />
              Ver documento
            </Button>
          ) : (
            <Badge
              variant="outline"
              className="h-6 gap-1.5 border-amber-300 bg-amber-50 px-2.5 text-[12px] font-semibold text-amber-800"
            >
              <TriangleAlert aria-hidden="true" />
              Sin documento de respaldo
            </Badge>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          aria-label={`Editar ${certification.name}`}
          disabled={isBusy}
          onClick={() => onEdit(certification)}
          className="h-8 px-2 text-[13px] font-semibold text-ink"
        >
          Editar
        </Button>
        <Button
          type="button"
          variant="ghost"
          aria-label={`Eliminar ${certification.name}`}
          disabled={isBusy}
          onClick={() => onDelete(certification)}
          className="h-8 px-2 text-[13px] font-semibold text-accent hover:bg-interaction hover:text-accent"
        >
          Eliminar
        </Button>
      </div>
    </article>
  );
}
