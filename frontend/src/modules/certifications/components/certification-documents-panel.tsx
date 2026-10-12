"use client";

import type { CertificationDocumentsPanelProps } from "../types/certification-documents-panel-props.types";
import { CertificationDocumentItem } from "./certification-document-item";
import { SectionCard } from "@/modules/profile/components/section-card";

export function CertificationDocumentsPanel({
  certifications = [],
  uploadedInfo = {},
  isBusy = false,
  form = null,
  onView,
}: CertificationDocumentsPanelProps) {
  const certificationsWithDocument = certifications.filter(
    (certification) => certification.hasDocument,
  );

  return (
    <SectionCard title="Documentos de respaldo">
      <div className="flex flex-col gap-6">
        {form ? (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300 ease-out">{form}</div>
        ) : null}
        <section aria-label="Documentos cargados" className="flex flex-col gap-1">
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
                    isBusy={isBusy}
                    onView={onView}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </SectionCard>
  );
}
