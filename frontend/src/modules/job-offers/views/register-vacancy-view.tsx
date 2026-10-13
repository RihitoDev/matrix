"use client";

import { useState } from "react";
import { ConfirmDialog } from "../components/confirm-dialog";
import { InformationStep } from "../components/information-step";
import { PreviewStep } from "../components/preview-step";
import { RequirementsStep } from "../components/requirements-step";
import { VacancyStepper } from "../components/vacancy-stepper";
import { DISCARD_DIALOG_TEXT, LEAVE_DIALOG_TEXT } from "../constants/vacancies.constants";
import { useJobOfferForm } from "../hooks/use-job-offer-form";
import { useLeaveGuard } from "../hooks/use-leave-guard";
import { usePublishJobOffer } from "../hooks/use-publish-job-offer";
import { getCurrentCompany } from "../utils/get-current-company";

export function RegisterVacancyView() {
  const {
    currentStep,
    conditions,
    errors,
    hasUnsavedChanges,
    updateField,
    selectModality,
    validateField,
    handleContinue,
    handleRequirementsContinue,
    goBack,
    reset,
  } = useJobOfferForm();
  const publication = usePublishJobOffer();
  const leaveGuard = useLeaveGuard(hasUnsavedChanges && !publication.isSuccess);
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false);
  const company = getCurrentCompany();

  const handleCancel = () => {
    if (hasUnsavedChanges) setIsDiscardDialogOpen(true);
  };

  const handleDiscard = () => {
    setIsDiscardDialogOpen(false);
    publication.reset();
    reset();
  };

  const handleFinish = () => {
    publication.reset();
    reset();
  };

  return (
    <div className="mx-auto w-full max-w-5xl">
      <h1 className="mb-6 font-tight text-3xl font-extrabold text-ink">Publicar vacante</h1>

      <div className="rounded-lg border border-border bg-surface p-6 shadow-sm">
        <VacancyStepper currentStep={currentStep} />

        {currentStep === 1 && (
          <InformationStep
            conditions={conditions}
            errors={errors}
            updateField={updateField}
            selectModality={selectModality}
            validateField={validateField}
            onCancel={handleCancel}
            onContinue={handleContinue}
          />
        )}

        {currentStep === 2 && (
          <RequirementsStep
            conditions={conditions}
            errors={errors}
            updateField={updateField}
            onPrevious={goBack}
            onContinue={handleRequirementsContinue}
          />
        )}

        {currentStep === 3 && (
          <PreviewStep
            conditions={conditions}
            company={company}
            isSubmitting={publication.isSubmitting}
            isPublished={publication.isSuccess}
            error={publication.error}
            onPrevious={goBack}
            onConfirm={() => void publication.submit(conditions)}
            onFinish={handleFinish}
          />
        )}
      </div>

      <ConfirmDialog
        isOpen={isDiscardDialogOpen}
        title={DISCARD_DIALOG_TEXT.title}
        description={DISCARD_DIALOG_TEXT.description}
        confirmLabel={DISCARD_DIALOG_TEXT.confirm}
        cancelLabel={DISCARD_DIALOG_TEXT.cancel}
        onConfirm={handleDiscard}
        onCancel={() => setIsDiscardDialogOpen(false)}
      />

      <ConfirmDialog
        isOpen={leaveGuard.isLeaveDialogOpen}
        title={LEAVE_DIALOG_TEXT.title}
        description={LEAVE_DIALOG_TEXT.description}
        confirmLabel={LEAVE_DIALOG_TEXT.confirm}
        cancelLabel={LEAVE_DIALOG_TEXT.cancel}
        onConfirm={leaveGuard.confirmLeave}
        onCancel={leaveGuard.cancelLeave}
      />
    </div>
  );
}
