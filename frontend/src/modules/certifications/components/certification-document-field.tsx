"use client";

import { useRef, type ChangeEvent } from "react";
import { FileText, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CERTIFICATE_FILE_ACCEPT } from "../config/certification-document.config";
import type { CertificationDocumentFieldProps } from "../types/certification-document-field-props.types";
import { formatFileSize } from "@/modules/profile/utils/format-file-size";
import { getFieldErrorProps } from "@/modules/profile/utils/get-field-error-props";
import { FormField } from "@/modules/profile/components/form-field";


export function CertificationDocumentField({
  id = "certification-document",
  selectedFile,
  error,
  disabled = false,
  isUploading = false,
  onSelectFile,
  onClearFile,
}: CertificationDocumentFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) {
      onSelectFile(file);
    }
  };

  return (
    <FormField id={id} label="Archivo de respaldo" isRequired error={error}>
      <Input
        ref={fileInputRef}
        id={id}
        type="file"
        accept={CERTIFICATE_FILE_ACCEPT}
        className="hidden"
        disabled={disabled}
        onChange={handleFileChange}
        {...getFieldErrorProps(id, error)}
      />
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-dashed border-border-strong bg-surface-soft px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <FileText aria-hidden="true" className="size-5 shrink-0 text-ink-soft" />
          <p className="text-[13px] break-all text-text-secondary">
            {selectedFile
              ? `${selectedFile.name} · ${formatFileSize(selectedFile.size)}`
              : "PDF, JPG o PNG - Selecciona el documento o imagen."}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {selectedFile ? (
            <Button
              type="button"
              variant="outline"
              aria-label="Quitar archivo seleccionado"
              className="h-10 shrink-0 border-border-strong bg-surface px-4 text-[13px] font-semibold text-ink hover:bg-surface-soft"
              disabled={disabled}
              onClick={onClearFile}
            >
              <X aria-hidden="true" className="size-4" />
              Quitar
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            className="h-10 shrink-0 border-border-strong bg-surface px-4 text-[13px] font-semibold text-ink hover:bg-surface-soft"
            disabled={disabled}
            onClick={() => fileInputRef.current?.click()}
          >
            {selectedFile ? "Reemplazar archivo" : "Seleccionar archivo"}
          </Button>
        </div>
      </div>
      {isUploading && selectedFile ? (
        <p role="status" className="flex items-center gap-2 text-[13px] text-text-secondary">
          <Loader2 aria-hidden="true" className="size-4 animate-spin" />
          Subiendo documento...
        </p>
      ) : null}
    </FormField>
  );
}
