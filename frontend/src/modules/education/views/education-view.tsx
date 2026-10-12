"use client";

import { useState } from "react";
import { EducationDeleteDialog } from "../components/education-delete-dialog";
import { EducationForm } from "../components/education-form";
import { EducationListCard } from "../components/education-list-card";
import { FeedbackMessage } from "@/modules/profile/components/feedback-message";
import { ProfilePageLayout } from "@/modules/profile/components/profile-page-layout";
import { TrajectorySteps } from "@/modules/profile/components/trajectory-steps";
import { EDUCATION_UI_TEXTS } from "../constants/education-ui.constants";
import { useDeleteEducation } from "../hooks/use-delete-education";
import { useEducations } from "../hooks/use-educations";
import { useSaveEducation } from "../hooks/use-save-education";
import type { EducationFormValues } from "../types/education-form-values.types";
import type { EducationItem } from "../types/education-item.types";
import { toEducationFormValues } from "../utils/to-education-form-values";
import { toEducationPayload } from "../utils/to-education-payload";
import { toEducationUpdatePayload } from "../utils/to-education-update-payload";

export function EducationView() {
  const { educations, isLoading, error, reload } = useEducations();
  const [editingEducation, setEditingEducation] = useState<EducationItem | null>(null);
  const [pendingDelete, setPendingDelete] = useState<EducationItem | null>(null);
  const [formVersion, setFormVersion] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const resetForm = () => {
    setEditingEducation(null);
    setFormVersion((version) => version + 1);
  };

  const saveMutation = useSaveEducation(() => {
    resetForm();
    return reload();
  });

  const deleteMutation = useDeleteEducation(reload);

  const isBusy = saveMutation.isSaving || deleteMutation.isDeleting || pendingDelete !== null;

  const handleAdd = () => {
    if (isBusy) return;
    saveMutation.clearFeedback();
    deleteMutation.clearFeedback();
    resetForm();
    setIsFormOpen(true);
  };

  const handleCancel = () => {
    if (isBusy) return;
    saveMutation.clearFeedback();
    resetForm();
    setIsFormOpen(false);
  };

  const handleEdit = (education: EducationItem) => {
    if (isBusy) return;
    saveMutation.clearFeedback();
    deleteMutation.clearFeedback();
    setEditingEducation(education);
    setFormVersion((version) => version + 1);
    setIsFormOpen(true);
  };

  const handleDelete = (education: EducationItem) => {
    if (isBusy) return;
    saveMutation.clearFeedback();
    deleteMutation.clearFeedback();
    setPendingDelete(education);
  };

  const handleSubmit = async (values: EducationFormValues) => {
    if (isBusy) return;
    deleteMutation.clearFeedback();
    if (editingEducation) {
      await saveMutation.save(toEducationUpdatePayload(values, editingEducation), editingEducation.id);
    } else {
      await saveMutation.save(toEducationPayload(values));
    }
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete || deleteMutation.isDeleting) {
      return;
    }
    const deleted = await deleteMutation.deleteEducation(pendingDelete);
    if (!deleted) return;
    if (editingEducation?.id === pendingDelete.id) {
      resetForm();
    }
    setPendingDelete(null);
  };

  return (
    <ProfilePageLayout
      activeTab="trajectory"
      title={EDUCATION_UI_TEXTS.pageTitle}
      description={EDUCATION_UI_TEXTS.pageDescription}
    >
      <TrajectorySteps activeStep="education" />
      <FeedbackMessage feedback={pendingDelete ? null : deleteMutation.feedback} />
      <div className={`grid grid-cols-1 items-start gap-6 ${isFormOpen ? "lg:grid-cols-2" : ""}`}>
        <EducationListCard
          educations={educations}
          isLoading={isLoading}
          error={error}
          isBusy={isBusy}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        {isFormOpen ? (
          <EducationForm
            key={`${editingEducation?.id ?? "new"}-${formVersion}`}
            initialValues={editingEducation ? toEducationFormValues(editingEducation) : undefined}
            allowMissingEndDate={editingEducation?.endDate === null}
            isPending={saveMutation.isSaving}
            feedback={saveMutation.feedback}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        ) : null}
      </div>
      <EducationDeleteDialog
        isOpen={pendingDelete !== null}
        degree={pendingDelete?.degree ?? ""}
        feedback={deleteMutation.feedback}
        isDeleting={deleteMutation.isDeleting}
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => { if (!deleteMutation.isDeleting) setPendingDelete(null); }}
      />
    </ProfilePageLayout>
  );
}
