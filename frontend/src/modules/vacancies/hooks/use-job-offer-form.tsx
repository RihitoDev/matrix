"use client";

import { useState } from "react";
import type { SkillItem } from "@/modules/skills/types/skill-item.types";
import type { Modality } from "../types/job-offer.types";
import {
    INFORMATION_FIELDS_ORDER,
    isFieldEmpty,
    validateInformation,
    validateRequirements,
} from "../utils/validate-vacancy";

export type { Modality } from "../types/job-offer.types";

export interface VacancyConditions {
    title: string;
    modality: Modality | null;
    mapsLink: string;
    contractType: string;
    category: string;
    vacancyCount: string;
    salary: string;
    languages: string;
    description: string;
    /** Habilidades elegidas del catálogo (GET /skills): el id es el UUID que espera el backend. */
    skills: SkillItem[];
}

export type VacancyErrors = Partial<Record<keyof VacancyConditions, string>>;

export type UpdateVacancyField = <Field extends keyof VacancyConditions>(
    field: Field,
    value: VacancyConditions[Field],
) => void;

const REQUIREMENTS_FIELDS_ORDER: (keyof VacancyConditions)[] = ["description", "skills"];

const INITIAL_CONDITIONS: VacancyConditions = {
    title: "",
    modality: null,
    mapsLink: "",
    contractType: "",
    category: "",
    vacancyCount: "",
    salary: "",
    languages: "",
    description: "",
    skills: [],
};

function focusField(field: keyof VacancyConditions) {
    const element = document.getElementById(field);
    if (!element) return;
    element.scrollIntoView({ behavior: "smooth", block: "center" });
    element.focus();
}

export function useJobOfferForm() {
    const [currentStep, setCurrentStep] = useState(1);
    const [conditions, setConditions] = useState<VacancyConditions>(INITIAL_CONDITIONS);
    const [errors, setErrors] = useState<VacancyErrors>({});

    function clearError(field: keyof VacancyConditions) {
        setErrors((prev) => {
            if (!prev[field]) return prev;
            const next = { ...prev };
            delete next[field];
            return next;
        });
    }

    const updateField: UpdateVacancyField = (field, value) => {
        setConditions((prev) => ({ ...prev, [field]: value }));
        clearError(field);
    };

    function selectModality(modality: Modality) {
        updateField("modality", modality);
    }

    /** Valida un campo al perder el foco. Si está vacío no marca error: eso lo hace "Continuar". */
    function validateField(field: keyof VacancyConditions) {
        if (isFieldEmpty(field, conditions)) {
            clearError(field);
            return;
        }
        const message = validateInformation(conditions)[field];
        if (message) {
            setErrors((prev) => ({ ...prev, [field]: message }));
        } else {
            clearError(field);
        }
    }

    function validateMapsLink() {
        validateField("mapsLink");
    }

    function applyStepErrors(
        fields: (keyof VacancyConditions)[],
        found: VacancyErrors,
    ): keyof VacancyConditions | undefined {
        setErrors((prev) => {
            const next = { ...prev };
            fields.forEach((field) => delete next[field]);
            return { ...next, ...found };
        });
        return fields.find((field) => found[field]);
    }

    function goNext() {
        setCurrentStep((step) => Math.min(step + 1, 3));
    }

    function goBack() {
        setCurrentStep((step) => Math.max(step - 1, 1));
    }

    function handleContinue() {
        const firstInvalid = applyStepErrors(INFORMATION_FIELDS_ORDER, validateInformation(conditions));
        if (firstInvalid) {
            focusField(firstInvalid);
            return;
        }
        goNext();
    }

    function handleRequirementsContinue() {
        const firstInvalid = applyStepErrors(REQUIREMENTS_FIELDS_ORDER, validateRequirements(conditions));
        if (firstInvalid) {
            focusField(firstInvalid);
            return;
        }
        goNext();
    }

    function reset() {
        setConditions(INITIAL_CONDITIONS);
        setErrors({});
        setCurrentStep(1);
    }

    return {
        currentStep,
        conditions,
        errors,
        updateField,
        selectModality,
        validateField,
        validateMapsLink,
        handleContinue,
        handleRequirementsContinue,
        goNext,
        goBack,
        reset,
    };
}
