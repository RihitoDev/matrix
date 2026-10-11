"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { CERTIFICATE_FILE_ACCEPT } from "../config/certification-document.config";
import type { Certification } from "../types/certification.types";
import type { CertificationDocumentsPanelProps } from "../types/certification-documents-panel-props.types";
import { validateCertificateFile } from "../utils/validate-certificate-file";
import { CertificationDocumentForm } from "./certification-document-form";
import { CertificationDocumentItem } from "./certification-document-item";
import { ConfirmDeleteDialog } from "@/modules/profile/components/confirm-delete-dialog";
import { SectionCard } from "@/modules/profile/components/section-card";

export function CertificationDocumentsPanel({
  certifications = [],
  uploadedInfo = {},
  isBusy = false,
  onUpload,
  onRemove,
  onView,
  onInvalidFile,
}: CertificationDocumentsPanelProps) {
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [replacing, setReplacing] = useState<Certification | null>(null);
  const [pendingRemoval, setPendingRemoval] = useState<Certification | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  
  const certificationsWithDocument = certifications.filter(
    (certification) => certification.hasDocument,
  );

  const saveUpload = async (certification: Certification, file: File): Promise<boolean> => {
    return await onUpload(certification, file);
  };

  const handleLinkDocument = (certificationId: string, file: File): Promise<boolean> | boolean => {
    const certification = certifications.find((item) => item.id === certificationId);
    return certification ? saveUpload(certification, file) : false;
  };

  const handleReplaceClick = (certification: Certification) => {
    setReplacing(certification);
    replaceInputRef.current?.click();
  };

  const handleReplaceChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !replacing) {
      return;
    }
    const validationError = validateCertificateFile(file);
    if (validationError) {
      onInvalidFile(validationError);
      return;
    }
    await saveUpload(replacing, file);
  };

  const handleConfirmRemoval = async () => {
    if (!pendingRemoval) {
      return;
    }
    setIsRemoving(true);
    try {
      await onRemove(pendingRemoval);
    } finally {
      setIsRemoving(false);
      setPendingRemoval(null);
    }
  };

  return (
    <SectionCard title="Documentos de respaldo">
      <div className="flex flex-col gap-6">
        <CertificationDocumentForm
          certifications={certifications}
          isPending={isBusy}
          onSubmit={handleLinkDocument}
        />
        <Separator />
        <section aria-label="Documentos cargados" className="flex flex-col gap-1">
          <p className="text-[12px] font-semibold tracking-wide text-text-secondary">
            DOCUMENTOS CARGADOS
          </p>
          {certificationsWithDocument.length === 0 ? (
            <p className="py-3 text-[14px] text-text-secondary">
              Aún no has cargado documentos de respaldo.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {certificationsWithDocument.map((certification) => (
                <li key={certification.id}>
                  <CertificationDocumentItem
                    certification={certification}
                    info={uploadedInfo[certification.id]}
                    isBusy={isBusy || isRemoving}
                    onView={onView}
                    onReplace={handleReplaceClick}
                    onRemove={setPendingRemoval}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
        <Input
          ref={replaceInputRef}
          type="file"
          accept={CERTIFICATE_FILE_ACCEPT}
          aria-label="Archivo de reemplazo"
          className="hidden"
          onChange={handleReplaceChange}
        />
      </div>
      <ConfirmDeleteDialog
        isOpen={pendingRemoval !== null}
        title="Eliminar documento"
        message={`Se eliminará el documento de "${pendingRemoval?.name ?? ""}". Esta acción no se puede deshacer.`}
        isDeleting={isRemoving}
        onConfirm={handleConfirmRemoval}
        onCancel={() => setPendingRemoval(null)}
      />
    </SectionCard>
  );
}
