"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { CertificationCard } from "../components/certification-card";
import { CertificationDeleteDialog } from "../components/certification-delete-dialog";
import { CertificationDocumentViewer } from "../components/certification-document-viewer";
import { CertificationDocumentsPanel } from "../components/certification-documents-panel";
import { CertificationForm } from "../components/certification-form";
import { DEFAULT_DOCUMENT_TITLE } from "../constants/certification-form.constants";
import { FeedbackMessage } from "@/modules/profile/components/feedback-message";
import { ProfilePageLayout } from "@/modules/profile/components/profile-page-layout";
import { SectionCard } from "@/modules/profile/components/section-card";
import { TrajectorySteps } from "@/modules/profile/components/trajectory-steps";
import { useCertificationDocument } from "../hooks/use-certification-document";
import { useCertifications } from "../hooks/use-certifications";
import { useDeleteCertification } from "../hooks/use-delete-certification";
import { useSaveCertification } from "../hooks/use-save-certification";
import type { Certification } from "../types/certification.types";
import type { CertificationDocumentChange } from "../types/certification-document-change.types";
import type { CreateCertificationDto } from "../types/create-certification-dto.types";
import type { Feedback } from "@/modules/profile/types/feedback.types";

function toFormValues(certification: Certification): CreateCertificationDto {
  return {
    name: certification.name,
    issuingOrganization: certification.issuingOrganization,
    issueDate: certification.issueDate,
  };
}

export function CertificationsView() {
  const { certifications, isLoading, error, reload } = useCertifications();
  const [isCreating, setIsCreating] = useState(false);
  const [editing, setEditing] = useState<Certification | null>(null);
  const [formVersion, setFormVersion] = useState(0);
  const formVersionRef = useRef(0);
  const [pendingDelete, setPendingDelete] = useState<Certification | null>(null);
  const [focusRequest, setFocusRequest] = useState(0);

  const deleteMutation = useDeleteCertification(() => {
    void reload();
  });
  const certificationDocument = useCertificationDocument();
  const saveCertification = useSaveCertification({
    applyDocumentChange: certificationDocument.applyDocumentChange,
    onPersisted: () => {
      void reload();
    },
  });

  const isOpeningDocument = certificationDocument.isOpening;
  const visibleFeedback: Feedback | null =
    saveCertification.feedback ??
    certificationDocument.feedback ??
    deleteMutation.feedback ??
    (error ? { type: "error", message: error } : null);

  const clearFeedback = () => {
    saveCertification.clearFeedback();
    deleteMutation.clearFeedback();
    certificationDocument.clearFeedback();
  };

  const startNewFormVersion = () => {
    formVersionRef.current += 1;
    setFormVersion(formVersionRef.current);
  };

  const openEditForm = (certification: Certification) => {
    clearFeedback();
    saveCertification.reset();
    setIsCreating(false);
    setEditing(certification);
    startNewFormVersion();
  };

  const closeForm = () => {
    saveCertification.reset();
    setEditing(null);
    setIsCreating(false);
    startNewFormVersion();
  };

  useEffect(() => {
    if (focusRequest > 0) {
      document.getElementById("certification-name")?.focus();
    }
  }, [focusRequest]);

  const openCreateForm = () => {
    clearFeedback();
    saveCertification.reset();
    setEditing(null);
    setIsCreating(true);
    startNewFormVersion();
    setFocusRequest((request) => request + 1);
  };

  const handleSubmit = async (
    values: CreateCertificationDto,
    change: CertificationDocumentChange,
  ): Promise<string | null> => {
    const submittedVersion = formVersionRef.current;
    const result = await saveCertification.save(editing?.id ?? null, values, change);
    if (result.status === "failed") {
      return result.fileError;
    }

    if (submittedVersion === formVersionRef.current) {
      closeForm();
    }
    return null;
  };

  const openDeleteDialog = (certification: Certification) => {
    clearFeedback();
    setPendingDelete(certification);
  };

  const handleConfirmDelete = async (certification: Certification) => {
    const wasDeleted = await deleteMutation.deleteCertification(certification);
    if (wasDeleted && editing?.id === certification.id) {
      closeForm();
    }
    setPendingDelete(null);
  };

  const handleViewDocument = (certification: Certification) => {
    clearFeedback();
    void certificationDocument.openDocument(certification);
  };

  const getCurrentDocumentName = (certification: Certification | null) => {
    if (!certification?.hasDocument) {
      return undefined;
    }
    return certificationDocument.uploadedInfo[certification.id]?.fileName ?? DEFAULT_DOCUMENT_TITLE;
  };

  const renderAddButton = (className: string) => (
    <Button
      type="button"
      className={className}
      onClick={openCreateForm}
    >
      + Agregar certificación
    </Button>
  );

  const renderList = () => {
    if (isLoading) {
      return <p className="py-3 text-[14px] text-text-secondary">Cargando certificaciones...</p>;
    }

    if (certifications.length === 0) {
      return error ? null : (
        <div className="flex flex-col items-start gap-4 py-3">
          <p className="text-[14px] text-text-secondary">Aún no has agregado certificaciones.</p>
          {!isCreating && renderAddButton(
            "h-11 bg-accent px-5 text-[14px] font-semibold text-white hover:bg-danger",
          )}
        </div>
      );
    }

    return (
      <ul aria-label="Certificaciones" className="flex flex-col divide-y divide-border">
        {certifications.map((certification) => (
          <li key={certification.id}>
            <CertificationCard
              certification={certification}
              isBusy={deleteMutation.isDeleting || isOpeningDocument}
              onEdit={openEditForm}
              onDelete={openDeleteDialog}
              onViewDocument={handleViewDocument}
            />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <ProfilePageLayout
      activeTab="trajectory"
      title="Trayectoria"
      description="Muestra tus estudios, experiencia, habilidades y certificaciones"
    >
      <TrajectorySteps activeStep="certifications" />
      {visibleFeedback ? <FeedbackMessage feedback={visibleFeedback} /> : null}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <SectionCard title="Tus certificaciones">
          <div className="flex flex-col gap-6">
            <section
              aria-label="Certificaciones registradas"
              className={`flex flex-col gap-1 ${certifications.length > 0 ? "overflow-y-auto max-h-[380px]" : ""}`}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-background py-2">
                <p className="text-[12px] font-semibold tracking-wide text-text-secondary">
                  CERTIFICACIONES REGISTRADAS
                </p>
                {certifications.length > 0
                  ? renderAddButton(
                      "h-9 border border-border-strong bg-surface px-4 text-[13px] font-semibold text-ink hover:bg-surface-soft",
                    )
                  : null}
              </div>
              {renderList()}
            </section>
          </div>
        </SectionCard>
        <CertificationDocumentsPanel
          certifications={certifications}
          uploadedInfo={certificationDocument.uploadedInfo}
          isBusy={isOpeningDocument}
          form={
            isCreating || editing ? (
              <CertificationForm
                key={`${editing ? editing.id : "create"}-${formVersion}`}
                initialData={editing ? toFormValues(editing) : undefined}
                currentDocumentName={getCurrentDocumentName(editing)}
                onSubmit={handleSubmit}
                onCancel={closeForm}
              />
            ) : null
          }
          onView={handleViewDocument}
        />
      </div>
      <CertificationDocumentViewer
        preview={certificationDocument.preview}
        onClose={certificationDocument.closeDocument}
      />
      <CertificationDeleteDialog
        certification={pendingDelete}
        isDeleting={deleteMutation.isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </ProfilePageLayout>
  );
}
