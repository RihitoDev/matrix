import { Button } from "@/components/ui/button";
import { DEFAULT_DOCUMENT_TITLE } from "../constants/certification-form.constants";
import type { CertificationDocumentItemProps } from "../types/certification-document-item-props.types";

export function CertificationDocumentItem({
  certification,
  info,
  isBusy = false,
  onView,
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
        <p className="mt-0.5 break-words text-[13px] text-text-secondary [overflow-wrap:anywhere]">{subtitle}</p>
      </div>
    </article>
  );
}
