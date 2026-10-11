import { Button } from "@/components/ui/button";
import type { CertificationCardProps } from "../types/certification-card-props.types";
import { formatIssueDate } from "../utils/format-issue-date";

export function CertificationCard({
  certification,
  isBusy = false,
  onEdit,
  onDelete,
}: CertificationCardProps) {
  return (
    <article className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <h4 className="text-[15px] font-bold text-ink">{certification.name}</h4>
        <p className="mt-0.5 text-[13px] text-text-secondary">
          {certification.issuingOrganization} · Obtenida el{" "}
          <time dateTime={certification.issueDate}>{formatIssueDate(certification.issueDate)}</time>
        </p>
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
