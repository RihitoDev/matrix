"use client";

import { useState } from "react";
import { ConfirmDeleteDialog } from "@/modules/profile";
import { FeedbackMessage } from "@/modules/profile";
import { ProfilePageLayout } from "@/modules/profile";
import { WorkExperienceForm } from "../components/work-experience-form";
import { WorkExperienceListCard } from "../components/work-experience-list-card";
import { useDeleteWorkExperience } from "../hooks/use-delete-work-experience";
import { useSaveWorkExperience } from "../hooks/use-save-work-experience";
import { useWorkExperiences } from "../hooks/use-work-experiences";
import type { Feedback } from "@/modules/profile";
import type { WorkExperienceFormValues } from "../types/work-experience-form-values.types";
import type { WorkExperienceItem } from "../types/work-experience-item.types";
import { toWorkExperienceFormValues } from "../utils/to-work-experience-form-values";
import { toWorkExperiencePayload } from "../utils/to-work-experience-payload";

export function WorkExperienceView() {
  const { experiences, isLoading, error, reload } = useWorkExperiences();
  const [editingExperience, setEditingExperience] = useState<WorkExperienceItem | null>(null);
  const [pendingDelete, setPendingDelete] = useState<WorkExperienceItem | null>(null);
  const [formVersion, setFormVersion] = useState(0);

  const resetForm = () => {
    setEditingExperience(null);
    setFormVersion((version) => version + 1);
  };

  const saveMutation = useSaveWorkExperience(() => {
    resetForm();
    void reload();
  });

  const deleteMutation = useDeleteWorkExperience((deleted) => {
    if (editingExperience?.id === deleted.id) {
      resetForm();
    }
    void reload();
  });

  const isBusy = saveMutation.isSaving || deleteMutation.isDeleting;

  const listFeedback: Feedback | null =
    deleteMutation.feedback ?? (error ? { type: "error", message: error } : null);

  const handleEdit = (experience: WorkExperienceItem) => {
    if (isBusy) {
      return;
    }
    saveMutation.clearFeedback();
    deleteMutation.clearFeedback();
    setEditingExperience(experience);
  };

  const handleDelete = (experience: WorkExperienceItem) => {
    if (isBusy) {
      return;
    }
    saveMutation.clearFeedback();
    deleteMutation.clearFeedback();
    setPendingDelete(experience);
  };

  const handleConfirmDelete = async () => {
    if (pendingDelete) {
      await deleteMutation.deleteWorkExperience(pendingDelete);
    }
    setPendingDelete(null);
  };

  const handleSubmit = async (values: WorkExperienceFormValues) => {
    if (deleteMutation.isDeleting) {
      return;
    }
    deleteMutation.clearFeedback();
    await saveMutation.save(toWorkExperiencePayload(values), editingExperience?.id);
  };

  return (
    <ProfilePageLayout
      title="Experiencia laboral"
      description="Registra tus puestos y funciones."
    >
      <FeedbackMessage feedback={listFeedback} />
      <div className="grid grid-cols-1 items-start gap-7 xl:grid-cols-[minmax(280px,0.9fr)_minmax(0,1.3fr)]">
        <WorkExperienceListCard
          experiences={experiences}
          isLoading={isLoading}
          isBusy={isBusy}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        <WorkExperienceForm
          key={editingExperience ? editingExperience.id : `new-${formVersion}`}
          initialValues={
            editingExperience ? toWorkExperienceFormValues(editingExperience) : undefined
          }
          isPending={saveMutation.isSaving}
          feedback={saveMutation.feedback}
          onSubmit={handleSubmit}
          onCancel={resetForm}
        />
      </div>
      <ConfirmDeleteDialog
        isOpen={pendingDelete !== null}
        title="Eliminar experiencia"
        message={`Se eliminará "${pendingDelete?.position ?? ""}" de tu perfil. Esta acción no se puede deshacer.`}
        isDeleting={deleteMutation.isDeleting}
        onConfirm={() => {
          void handleConfirmDelete();
        }}
        onCancel={() => setPendingDelete(null)}
      />
    </ProfilePageLayout>
  );
}
