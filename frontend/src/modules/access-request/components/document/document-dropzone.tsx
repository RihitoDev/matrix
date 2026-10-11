"use client";

import { useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import { FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "cn";
import { useAccessRequestForm } from "../../contexts/access-request-context";
import { FieldError } from "../personal-data/field-error";

export function DocumentDropzone() {
  const { status, document: documentState, uploadDocument } = useAccessRequestForm();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const isUploading = status === "uploading";
  const isDisabled = status !== "idle";
  const errorId = documentState.error ? "document-error" : undefined;

  // Solo se toma el primer archivo: el paso admite un único documento
  function pickFirst(files: FileList | null | undefined) {
    const file = files?.[0];
    if (file) void uploadDocument(file);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    pickFirst(event.target.files);
    // Se limpia para poder elegir el mismo archivo otra vez
    event.target.value = "";
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (!isDisabled) setIsDragging(true);
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    // Los hijos disparan dragleave al cruzarlos: solo cuenta salir de la zona
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
    setIsDragging(false);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    if (isDisabled) return;
    pickFirst(event.dataTransfer?.files);
  }

  return (
    <div>
      <div
        data-slot="document-dropzone"
        data-dragging={isDragging ? "true" : undefined}
        onDragEnter={handleDragOver}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "flex flex-col items-center gap-3 rounded-lg border-2 border-dashed border-border-strong bg-surface px-6 py-10 text-center transition-colors focus-within:border-ink focus-within:ring-3 focus-within:ring-interaction",
          isDragging && "border-ink bg-surface-soft",
          isDisabled && "opacity-60",
        )}
      >
        <span aria-hidden="true" className="flex size-12 items-center justify-center rounded-lg bg-interaction text-accent">
          <FileUp className="size-6" />
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-[15px] font-semibold text-ink 2xl:text-lg">Arrastra tu documento aquí o elige un archivo.</p>
          <p className="text-[12.5px] text-text-secondary 2xl:text-base">JPG, PNG o PDF. Máximo 10 MB.</p>
        </div>

        <Input
          ref={inputRef}
          id="document-file"
          name="document-file"
          type="file"
          accept="image/jpeg,image/png,application/pdf,.jpg,.jpeg,.png,.pdf"
          aria-label="Archivo del documento"
          aria-describedby={errorId}
          aria-invalid={documentState.error ? true : undefined}
          disabled={isDisabled}
          onChange={handleChange}
          className="sr-only"
        />
        <Button
          type="button"
          variant="secondary"
          disabled={isDisabled}
          onClick={() => inputRef.current?.click()}
          className="h-[42px] rounded-md px-5 text-[14.5px] font-semibold text-ink 2xl:h-12"
        >
          Elegir archivo
        </Button>

        {isUploading ? (
          <div className="flex w-full max-w-sm flex-col gap-2" role="status">
            <Progress value={documentState.progress} aria-label="Progreso de la subida" />
            <p className="text-[12.5px] text-text-secondary 2xl:text-base">{`Subiendo... ${documentState.progress}%`}</p>
          </div>
        ) : null}
      </div>
      <FieldError id="document-error" message={documentState.error ?? undefined} />
    </div>
  );
}
