import { Button } from "@/components/ui/button";
import type { CertificationDocumentItemProps } from "../types/certification-document-item-props.types";

const DEFAULT_DOCUMENT_TITLE = "Documento de respaldo";

export function CertificationDocumentItem({
  certification,
  info,
  isBusy = false,
  onView,
  onReplace,
  onRemove,
}: CertificationDocumentItemProps) {
  const subtitle = [info?.format, info?.uploadedAt, certification.name]
    .filter((part): part is string => Boolean(part))
    .join(" · ");

  return (
    <article className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <Button
          type="button"
          variant="link"
          aria-label={`Ver documento de ${certification.name}`}
          disabled={isBusy}
          onClick={() => onView(certification)}
          className="h-auto max-w-full justify-start p-0 text-[15px] font-bold break-all text-ink"
        >
          {info?.fileName ?? DEFAULT_DOCUMENT_TITLE}
        </Button>
        <p className="mt-0.5 text-[13px] text-text-secondary">{subtitle}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          aria-label={`Reemplazar documento de ${certification.name}`}
          disabled={isBusy}
          onClick={() => onReplace(certification)}
          className="h-8 px-2 text-[13px] font-semibold text-ink"
        >
          Reemplazar
        </Button>
        <Button
          type="button"
          variant="ghost"
          aria-label={`Eliminar documento de ${certification.name}`}
          disabled={isBusy}
          onClick={() => onRemove(certification)}
          className="h-8 px-2 text-[13px] font-semibold text-accent hover:bg-interaction hover:text-accent"
        >
          Eliminar
        </Button>
      </div>
    </article>
  );
}
