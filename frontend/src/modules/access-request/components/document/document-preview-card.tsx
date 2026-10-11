"use client";

import Image from "next/image";
import { CircleCheck, Eye, FileText, X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "cn";
import { useAccessRequestForm } from "../../contexts/access-request-context";
import { formatFileSize } from "../../utils/format-file-size";
import { FieldError } from "../personal-data/field-error";

export function DocumentPreviewCard() {
  const { status, document: documentState, hasDocument, removeDocument } = useAccessRequestForm();
  const { previewUrl } = documentState;
  if (!hasDocument || !previewUrl) return null;

  const fileName = documentState.fileName ?? "Documento";
  const isPdf = documentState.mimeType === "application/pdf";
  const isRemoving = status === "removing";

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
      <div className="flex flex-wrap items-center gap-3">
        <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-md border border-border text-ink-soft">
          <FileText className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14.5px] font-semibold text-ink 2xl:text-base">{fileName}</p>
          <p className="text-[12.5px] text-text-secondary 2xl:text-base">{formatFileSize(documentState.fileSize ?? 0)}</p>
        </div>
        <p className="flex items-center gap-1.5 text-[13.5px] font-semibold text-ink 2xl:text-base">
          <CircleCheck aria-hidden="true" className="size-4" />
          Listo
        </p>
        {/* Button con render={<a />} pone role="button" al ancla; por eso se usa <a> con las clases de buttonVariants */}
        <a
          href={previewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: "ghost" }), "h-9 rounded-md px-3 text-[13.5px] font-semibold text-ink")}
        >
          <Eye aria-hidden="true" />
          Ver
        </a>
        <Button
          type="button"
          variant="ghost"
          disabled={status !== "idle"}
          onClick={() => void removeDocument()}
          className="h-9 rounded-md px-3 text-[13.5px] font-semibold text-danger"
        >
          {isRemoving ? (
            "Quitando..."
          ) : (
            <>
              <X aria-hidden="true" />
              Quitar
            </>
          )}
        </Button>
      </div>

      <div className="relative h-72 overflow-hidden rounded-md border border-border bg-surface-soft">
        {isPdf ? (
          <object data={previewUrl} type="application/pdf" aria-label={`Vista previa de ${fileName}`} className="size-full">
            <p className="p-4 text-[13.5px] text-text-secondary">No se puede mostrar la vista previa de este PDF.</p>
          </object>
        ) : (
          // Next ya omite la optimización con URL blob; unoptimized lo deja explícito
          <Image src={previewUrl} alt={`Vista previa de ${fileName}`} fill unoptimized className="object-contain" />
        )}
      </div>
      <FieldError id="document-remove-error" message={documentState.error ?? undefined} />
    </div>
  );
}
