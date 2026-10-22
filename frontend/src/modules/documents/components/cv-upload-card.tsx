import { CircleCheck, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { CvUploadCardProps } from "../types/cv-upload-card-props.types";
import { formatFileSize } from "@/modules/profile";
import { SectionCard } from "@/modules/profile";

export function CvUploadCard({
  selectedFile,
  hasSavedCv,
  isLoading = false,
  isUploading,
  isBusy,
  onSelectFile,
  onConfirmUpload,
}: CvUploadCardProps) {
  if (isLoading) {
    return (
      <SectionCard title="Subir currículum">
        <div aria-busy="true" className="flex flex-col items-center gap-3 px-6 py-10">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-12 w-40" />
        </div>
      </SectionCard>
    );
  }

  if (hasSavedCv) {
    return (
      <SectionCard title="Subir currículum">
        <div className="flex flex-col items-center gap-2 rounded-lg bg-surface-soft px-6 py-12 text-center">
          <CircleCheck aria-hidden="true" className="size-6 text-ink-soft" />
          <p className="text-[15px] font-semibold text-ink">Ya tienes un CV guardado</p>
          <p className="text-[13px] text-text-secondary">
            Para cambiarlo, usa «Reemplazar CV» en «Archivo guardado».
          </p>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Subir currículum">
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border-strong bg-interaction/40 px-6 py-12 text-center">
        <p className="text-[15px] font-semibold text-ink">Selecciona tu CV en formato PDF</p>
        <Button
          type="button"
          variant="outline"
          className="mt-3 h-10 border-border-strong px-4 text-sm text-ink hover:bg-surface-soft"
          disabled={isBusy}
          onClick={onSelectFile}
        >
          Seleccionar PDF
        </Button>
        {selectedFile ? (
          <p className="mt-2 text-[13px] break-all text-text-secondary">
            {selectedFile.name} · {formatFileSize(selectedFile.size)}
          </p>
        ) : null}
      </div>
      <div className="mt-6 flex justify-end">
        <Button
          type="button"
          className="h-10 bg-accent px-4 text-sm text-white hover:bg-brand-hover"
          disabled={!selectedFile || isBusy}
          onClick={selectedFile ? () => onConfirmUpload(selectedFile) : undefined}
        >
          {isUploading ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : null}
          {isUploading ? "Cargando..." : "Confirmar carga"}
        </Button>
      </div>
    </SectionCard>
  );
}
