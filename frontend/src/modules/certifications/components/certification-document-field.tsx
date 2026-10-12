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

const OUTLINE_BUTTON_CLASS =
  "h-10 shrink-0 border-border-strong bg-surface px-4 text-[13px] font-semibold text-ink hover:bg-surface-soft";

export function CertificationDocumentField({
  id = "certification-document",
  selectedFile,
  currentDocumentName,
  isRemovalPending = false,
  isRequired = true,
  error,
  disabled = false,
  isUploading = false,
  isReading = false,
  onSelectFile,
  onClearFile,
  onRemoveCurrent,
}: CertificationDocumentFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasCurrentDocument = Boolean(currentDocumentName);
  const canRemoveCurrent = hasCurrentDocument && !isRemovalPending && Boolean(onRemoveCurrent);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) {
      onSelectFile(file);
    }
  };

  const handleClearFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClearFile();
  };

  const getDescription = () => {
    if (isReading) {
      return "Leyendo y validando el archivo...";
    }
    if (selectedFile) {
      return `${selectedFile.name} · ${formatFileSize(selectedFile.size)}`;
    }
    if (isRemovalPending) {
      return "El documento actual se eliminará al guardar.";
    }
    if (currentDocumentName) {
      return currentDocumentName;
    }
    return "PDF, JPG o PNG - Selecciona el documento o imagen.";
  };

  const getPickerLabel = () => {
    if (selectedFile) {
      return "Cambiar archivo";
    }
    return hasCurrentDocument ? "Reemplazar" : "Seleccionar archivo";
  };

  return (
    <FormField id={id} label="Archivo de respaldo" isRequired={isRequired} error={error}>
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
          {isReading ? (
            <Loader2 aria-hidden="true" className="size-5 shrink-0 animate-spin text-ink-soft" />
          ) : (
            <FileText aria-hidden="true" className="size-5 shrink-0 text-ink-soft" />
          )}
          <p
            role={isReading ? "status" : undefined}
            className="text-[13px] break-all text-text-secondary"
          >
            {getDescription()}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {selectedFile ? (
            <Button
              type="button"
              variant="outline"
              aria-label="Quitar archivo seleccionado"
              className={OUTLINE_BUTTON_CLASS}
              disabled={disabled || isReading}
              onClick={handleClearFile}
            >
              <X aria-hidden="true" className="size-4" />
              Quitar
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            className={OUTLINE_BUTTON_CLASS}
            disabled={disabled || isReading}
            onClick={() => fileInputRef.current?.click()}
          >
            {getPickerLabel()}
          </Button>
          {canRemoveCurrent ? (
            <Button
              type="button"
              variant="outline"
              aria-label="Eliminar documento actual"
              className={`${OUTLINE_BUTTON_CLASS} text-accent hover:text-accent`}
              disabled={disabled || isReading}
              onClick={onRemoveCurrent}
            >
              Eliminar
            </Button>
          ) : null}
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
