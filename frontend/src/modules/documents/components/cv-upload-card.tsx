import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CvUploadCardProps } from "../types/cv-upload-card-props.types";
import { formatFileSize } from "@/modules/profile/utils/format-file-size";
import { SectionCard } from "@/modules/profile/components/section-card";

export function CvUploadCard({
  selectedFile,
  isUploading,
  isBusy,
  onSelectFile,
  onConfirmUpload,
}: CvUploadCardProps) {
  return (
    <SectionCard title="Subir currículum">
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border-strong bg-surface-soft px-6 py-10 text-center">
        <p className="text-[15px] font-semibold text-ink">Selecciona tu CV en formato PDF</p>
        <Button
          type="button"
          variant="outline"
          className="mt-3 h-12 border-border-strong bg-surface px-6 text-[14px] font-semibold text-ink hover:bg-surface-soft"
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
          className="h-12 bg-accent px-6 text-[14px] font-semibold text-white hover:bg-danger"
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
