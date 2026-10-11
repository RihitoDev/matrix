import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { SavedCvCardProps } from "../types/saved-cv-card-props.types";
import { formatFileSize } from "@/modules/profile/utils/format-file-size";
import { formatUploadDate } from "../utils/format-upload-date";
import { SectionCard } from "@/modules/profile/components/section-card";

export function SavedCvCard({
  savedCv,
  isLoading = false,
  isBusy = false,
  onReplace,
  onDelete,
}: SavedCvCardProps) {
  if (isLoading) {
    return (
      <SectionCard title="Archivo guardado">
        <div aria-busy="true" className="flex flex-col gap-3">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <span className="sr-only">Cargando tu CV...</span>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Archivo guardado">
      {savedCv ? (
        <div>
          <p className="text-[15px] font-bold break-words text-ink">{savedCv.fileName}</p>
          <p className="mt-1 text-[13px] text-text-secondary">
            {savedCv.fileType} · {formatFileSize(savedCv.sizeInBytes)} · Actualizado el{" "}
            {formatUploadDate(savedCv.updatedAt)}
          </p>
          <p className="mt-3 flex items-center gap-2 border-b border-border pb-5 text-[13px] font-semibold text-ink-soft">
            <Check aria-hidden="true" className="size-4" />
            Cargado correctamente
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-12 border-border-strong bg-surface px-6 text-[14px] font-semibold text-ink hover:bg-surface-soft"
              disabled={isBusy}
              onClick={onReplace}
            >
              Reemplazar CV
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-12 border-accent bg-surface px-6 text-[14px] font-semibold text-accent hover:bg-interaction hover:text-accent"
              disabled={isBusy}
              onClick={onDelete}
            >
              Eliminar CV
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-[14px] text-text-secondary">
          Al confirmar la carga, el archivo se mostrará aquí.
        </p>
      )}
    </SectionCard>
  );
}
