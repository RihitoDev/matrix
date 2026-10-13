"use client";

import Image from "next/image";
import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { downloadFile } from "@/shared/utils/download-file";
import { CERTIFICATION_DOCUMENT_MESSAGES } from "../config/certification-document.config";
import type { CertificationDocumentPreview } from "../types/certification-document-preview.types";
import type { CertificationDocumentViewerProps } from "../types/certification-document-viewer-props.types";

function DocumentPreviewContent({ preview }: { preview: CertificationDocumentPreview }) {
  if (preview.file.type.startsWith("image/")) {
    return (
      <div className="relative h-[60vh] w-full overflow-hidden rounded-lg border border-border">
        <Image
          src={preview.previewUrl}
          alt={`Documento de ${preview.certificationName}`}
          fill
          unoptimized
          className="object-contain"
        />
      </div>
    );
  }

  if (preview.file.type === "application/pdf") {
    return (
      <iframe
        src={preview.previewUrl}
        title={`Documento de ${preview.certificationName}`}
        className="h-[60vh] w-full rounded-lg border border-border"
      />
    );
  }

  return (
    <p className="py-6 text-center text-[14px] text-text-secondary">
      {CERTIFICATION_DOCUMENT_MESSAGES.previewUnavailable}
    </p>
  );
}

function CertificationDocumentViewerBody({
  preview,
  onClose,
}: {
  preview: CertificationDocumentPreview;
  onClose: () => void;
}) {
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const handleDownload = () => {
    setDownloadError(null);
    try {
      downloadFile(preview.file, preview.fileName);
    } catch {
      setDownloadError(CERTIFICATION_DOCUMENT_MESSAGES.downloadError);
    }
  };

  return (
    <Dialog open onOpenChange={(isOpen) => (isOpen ? undefined : onClose())}>
      <DialogContent className="max-w-3xl gap-4 rounded-2xl border border-border bg-surface p-6 text-ink ring-0 sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-tight text-[20px] font-bold text-ink">
            Documento de respaldo
          </DialogTitle>
          <DialogDescription className="text-[14px] break-all text-text-secondary">
            {preview.certificationName} · {preview.fileName}
          </DialogDescription>
        </DialogHeader>
        <DocumentPreviewContent preview={preview} />
        {downloadError ? (
          <p role="alert" className="text-[13px] text-danger">
            {downloadError}
          </p>
        ) : null}
        <DialogFooter className="mx-0 mb-0 rounded-b-2xl border-t-0 bg-transparent p-0">
          <Button
            type="button"
            className="h-11 bg-accent px-5 text-[14px] font-semibold text-white hover:bg-danger"
            onClick={handleDownload}
          >
            <Download aria-hidden="true" className="size-4" />
            Descargar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CertificationDocumentViewer({ preview, onClose }: CertificationDocumentViewerProps) {
  if (!preview) {
    return null;
  }

  return <CertificationDocumentViewerBody key={preview.previewUrl} preview={preview} onClose={onClose} />;
}
