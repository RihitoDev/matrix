"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CertificationCard } from "../components/certification-card";
import { CertificationDeleteDialog } from "../components/certification-delete-dialog";
import { CertificationDocumentsPanel } from "../components/certification-documents-panel";
import { CertificationForm } from "../components/certification-form";
import { FeedbackMessage } from "@/modules/profile/components/feedback-message";
import { ProfilePageLayout } from "@/modules/profile/components/profile-page-layout";
import { SectionCard } from "@/modules/profile/components/section-card";
import { TrajectorySteps } from "@/modules/profile/components/trajectory-steps";
import { useCreateCertification, useUpdateCertification } from "../hooks/use-certification-mutations";
import { useCertificationDocument } from "../hooks/use-certification-document";
import { useCertifications } from "../hooks/use-certifications";
import { useDeleteCertification } from "../hooks/use-delete-certification";
import type { Certification } from "../types/certification.types";
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
  const [pendingDelete, setPendingDelete] = useState<Certification | null>(null);
  const [fileFeedback, setFileFeedback] = useState<Feedback | null>(null);
  const [focusRequest, setFocusRequest] = useState(0);

  const createMutation = useCreateCertification();
  const updateMutation = useUpdateCertification();
  const deleteMutation = useDeleteCertification(() => {
    void reload();
  });
  const certificationDocument = useCertificationDocument();

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const isBusy = isSaving || certificationDocument.isSaving || certificationDocument.isOpening;
  const visibleFeedback: Feedback | null =
    fileFeedback ??
    certificationDocument.feedback ??
    createMutation.feedback ??
    updateMutation.feedback ??
    deleteMutation.feedback ??
    (error ? { type: "error", message: error } : null);

  const clearFeedback = () => {
    createMutation.clearFeedback();
    updateMutation.clearFeedback();
    deleteMutation.clearFeedback();
    certificationDocument.clearFeedback();
    setFileFeedback(null);
  };

  const openEditForm = (certification: Certification) => {
    clearFeedback();
    setIsCreating(false);
    setEditing(certification);
  };

  const closeForm = () => {
    setEditing(null);
    setIsCreating(false);
    setFormVersion((version) => version + 1);
  };

  useEffect(() => {
    if (focusRequest > 0) {
      document.getElementById("certification-name")?.focus();
    }
  }, [focusRequest]);

  const openCreateForm = () => {
    clearFeedback();
    if (editing) {
      closeForm();
    }
    setIsCreating(true);
    setFocusRequest((request) => request + 1);
  };

  const handleSubmit = async (values: CreateCertificationDto, file: File | null) => {
    if (editing) {
      const savedCertification = await updateMutation.mutate({ id: editing.id, data: values });
      if (savedCertification) {
        closeForm();
        void reload();
      }
      return;
    }

    const savedCertification = await createMutation.mutate(values);
    if (!savedCertification) {
      return;
    }

    if (file) {
      const wasSaved = await certificationDocument.applyDocumentChange(savedCertification.id, {
        type: "replace",
        file,
      });

      if (!wasSaved) {
        await deleteMutation.deleteCertification(savedCertification);
        return;
      }
      certificationDocument.clearFeedback();
    }

    closeForm();
    void reload();
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

  const handleUploadDocument = async (certification: Certification, file: File) => {
    clearFeedback();
    const wasSaved = await certificationDocument.applyDocumentChange(certification.id, {
      type: "replace",
      file,
    });
    if (wasSaved) {
      await reload();
    }
    return wasSaved;
  };

  const handleRemoveDocument = async (certification: Certification) => {
    clearFeedback();
    const wasRemoved = await certificationDocument.applyDocumentChange(certification.id, {
      type: "remove",
    });
    if (wasRemoved) {
      await reload();
    }
    return wasRemoved;
  };

  const handleViewDocument = (certification: Certification) => {
    clearFeedback();
    void certificationDocument.openDocument(certification);
  };

  const handleInvalidFile = (message: string) => {
    clearFeedback();
    setFileFeedback({ type: "error", message });
  };

  const renderAddButton = (className: string) => (
    <Button
      type="button"
      className={className}
      disabled={isBusy}
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
              isBusy={deleteMutation.isDeleting || isBusy}
              onEdit={openEditForm}
              onDelete={openDeleteDialog}
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
            {isCreating || editing ? (
              <>
                <Separator />
                <CertificationForm
                  key={editing ? editing.id : `create-${formVersion}`}
                  initialData={editing ? toFormValues(editing) : undefined}
                  isPending={isSaving}
                  onSubmit={handleSubmit}
                  onCancel={closeForm}
                />
              </>
            ) : null}
          </div>
        </SectionCard>
        <CertificationDocumentsPanel
          certifications={certifications}
          uploadedInfo={certificationDocument.uploadedInfo}
          isBusy={isBusy}
          onUpload={handleUploadDocument}
          onRemove={handleRemoveDocument}
          onView={handleViewDocument}
          onInvalidFile={handleInvalidFile}
        />
      </div>
      <CertificationDeleteDialog
        certification={pendingDelete}
        isDeleting={deleteMutation.isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </ProfilePageLayout>
  );
}
