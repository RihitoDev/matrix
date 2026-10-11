"use client";

import { useState } from "react";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { activateMentor } from "../services/mentor-activation.service";
import { OrientationStep } from "../components/orientation/orientation-step";
import { ParticipationStep } from "../components/participation/participation-step";
import { ConfirmationStep } from "../components/wizard/confirmation-step";
import { MentorshipActivatedSummary } from "../components/wizard/mentorship-activated-summary";
import { MentorshipWizardShell } from "../components/wizard/mentorship-wizard-shell";
import { StepTechnicalAreas } from "../components/wizard/step-technical-areas";
import { useMentorshipCatalogs } from "../hooks/use-mentorship-catalogs";
import { useMentorshipWizard } from "../hooks/use-mentorship-wizard";
import { clearMentorshipWizardDraft } from "../services/mentorship-wizard-draft.service";

export function MentorshipView() {
  const {
    currentStep,
    selectedTechnicalAreaIds,
    wantsToParticipate,
    selectedOrientationTypeIds,
    goNext,
    goBack,
    goToStep,
    toggleTechnicalArea,
    canGoBack,
    canGoNext,
    setState,
  } = useMentorshipWizard();

  const {
    technicalAreas,
    isTechnicalAreasLoading,
    isTechnicalAreasError,
    retryTechnicalAreas,
    orientationTypes,
    isOrientationTypesLoading,
    isOrientationTypesError,
    retryOrientationTypes,
  } = useMentorshipCatalogs();

  const [isActivating, setIsActivating] = useState(false);
  const [isActivated, setIsActivated] = useState(false);
  const [activationError, setActivationError] = useState<string | null>(null);

  const canAdvance =
    currentStep === 1 ? wantsToParticipate : canGoNext;

  const handleParticipationChange = (value: boolean) => {
    setState((prev) => ({
      ...prev,
      wantsToParticipate: value,
    }));
  };

  const handleOrientationChange = (ids: string[]) => {
    setState((prev) => ({
      ...prev,
      selectedOrientationTypeIds: ids,
    }));
  };

  const selectedTechnicalAreas = technicalAreas.filter((area) =>
    selectedTechnicalAreaIds.includes(area.id),
  );

  const selectedOrientationTypes = orientationTypes.filter((orientation) =>
    selectedOrientationTypeIds.includes(orientation.id),
  );

  const handleActivate = async () => {
    if (isActivating) {
      return;
    }

    setIsActivating(true);
    setActivationError(null);

    try {
      await activateMentor({
        technicalAreaIds: selectedTechnicalAreaIds,
        orientationTypeIds: selectedOrientationTypeIds,
      });

      clearMentorshipWizardDraft();
      setIsActivated(true);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;

        if (status === 400) {
          setActivationError(
            "La información seleccionada no es válida. Revisa tu configuración e inténtalo nuevamente.",
          );
        } else if (status === 401) {
          setActivationError(
            "Tu sesión ya no es válida. Inicia sesión nuevamente para activar tu participación.",
          );
        } else if (status === 409) {
          setActivationError(
            "Tu participación como mentor ya está activa.",
          );
        } else if (status === 500) {
          setActivationError(
            "Ocurrió un problema en el servidor. Intenta nuevamente más tarde.",
          );
        } else {
          setActivationError(
            "No se pudo activar tu participación. Intenta nuevamente.",
          );
        }
      } else {
        setActivationError(
          "No se pudo activar tu participación. Intenta nuevamente.",
        );
      }
    } finally {
      setIsActivating(false);
    }
  };

  if (isActivated) {
    return (
      <MentorshipActivatedSummary
        technicalAreaNames={selectedTechnicalAreas.map((area) => area.name)}
        orientationLabels={selectedOrientationTypes.map(
          (orientation) => orientation.name,
        )}
      />
    );
  }

  const renderStepContent = () => {
    if (currentStep === 1) {
      return (
        <ParticipationStep
          isParticipating={wantsToParticipate}
          onParticipationChange={handleParticipationChange}
        />
      );
    }

    if (currentStep === 2) {
      if (isTechnicalAreasLoading) {
        return <p>Cargando áreas técnicas...</p>;
      }

      if (isTechnicalAreasError) {
        return (
          <div>
            <p>No se pudieron cargar las áreas técnicas.</p>
            <Button type="button" onClick={retryTechnicalAreas}>
              Reintentar
            </Button>
          </div>
        );
      }

      if (technicalAreas.length === 0) {
        return <p>No hay áreas técnicas disponibles.</p>;
      }

      return (
        <StepTechnicalAreas
          technicalAreas={technicalAreas}
          selectedIds={selectedTechnicalAreaIds}
          onToggle={toggleTechnicalArea}
        />
      );
    }

    if (currentStep === 3) {
      if (isOrientationTypesLoading) {
        return <p>Cargando tipos de orientación...</p>;
      }

      if (isOrientationTypesError) {
        return (
          <div>
            <p>No se pudieron cargar los tipos de orientación.</p>
            <Button type="button" onClick={retryOrientationTypes}>
              Reintentar
            </Button>
          </div>
        );
      }

      if (orientationTypes.length === 0) {
        return <p>No hay tipos de orientación disponibles.</p>;
      }

      return (
        <OrientationStep
          orientationTypes={orientationTypes}
          selectedOrientationTypeIds={selectedOrientationTypeIds}
          onSelectionChange={handleOrientationChange}
        />
      );
    }

    return (
      <ConfirmationStep
        wantsToParticipate={wantsToParticipate}
        selectedTechnicalAreas={selectedTechnicalAreas}
        selectedOrientationTypes={selectedOrientationTypes}
        isActivating={isActivating}
        activationError={activationError}
        onEditTechnicalAreas={() => goToStep(2)}
        onEditOrientationTypes={() => goToStep(3)}
        onActivate={handleActivate}
      />
    );
  };

  return (
    <MentorshipWizardShell
      currentStep={currentStep}
      canGoBack={canGoBack}
      canAdvance={canAdvance}
      onBack={goBack}
      onNext={goNext}
    >
      {renderStepContent()}
    </MentorshipWizardShell>
  );
}
