"use client";

import { VacancyStepper } from "../components/vacancy-stepper";
import { InformationStep } from "../components/information-step";
import { RequirementsStep } from "../components/requirements-step";
import { PreviewStep } from "../components/preview-step";
import { useJobOfferForm } from "../hooks/use-job-offer-form";
import { usePublishJobOffer } from "../hooks/use-publish-job-offer";
import { getCurrentCompany } from "../utils/get-current-company";

export function RegisterVacancyView() {
    const {
        currentStep,
        conditions,
        errors,
        updateField,
        selectModality,
        validateField,
        handleContinue,
        handleRequirementsContinue,
        goBack,
        reset,
    } = useJobOfferForm();
    const publication = usePublishJobOffer();
    const company = getCurrentCompany();

    function handleFinish() {
        publication.reset();
        reset();
    }

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
                    onConfirm={() => publication.submit(conditions)}
                    onFinish={handleFinish}
                />
            )}
        </div>
        </div>
    );
}
