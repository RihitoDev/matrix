"use client";

import { useState } from "react";
import type {
    Modality,
    UpdateVacancyField,
    VacancyConditions,
    VacancyErrors,
} from "../types/vacancy-conditions.types";
import {
    INFORMATION_FIELDS_ORDER,
    isFieldEmpty,
    validateInformation,
    validateRequirements,
} from "../utils/validate-vacancy";

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

    const hasUnsavedChanges = (Object.keys(INITIAL_CONDITIONS) as (keyof VacancyConditions)[]).some(
        (field) => !isFieldEmpty(field, conditions),
    );

    function reset() {
        setConditions(INITIAL_CONDITIONS);
        setErrors({});
        setCurrentStep(1);
    }

    return {
        currentStep,
        conditions,
        errors,
        hasUnsavedChanges,
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
