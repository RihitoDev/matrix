"use client";

import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type {
  Modality,
  UpdateVacancyField,
  VacancyConditions,
  VacancyErrors,
} from "../hooks/use-job-offer-form";
import {
  CONTRACT_TYPES,
  MAX_LANGUAGES_CHARS,
  MAX_TITLE_CHARS,
  MODALITIES,
} from "../constants/vacancies.constants";
import { FieldError } from "./field-error";

interface InformationStepProps {
  conditions: VacancyConditions;
  errors: VacancyErrors;
  updateField: UpdateVacancyField;
  selectModality: (modality: Modality) => void;
  validateField: (field: keyof VacancyConditions) => void;
  onContinue: () => void;
}

export function InformationStep({
  conditions,
  errors,
  updateField,
  selectModality,
  validateField,
  onContinue,
}: InformationStepProps) {
  const hasUnsavedChanges = 
    conditions.title !== "" || 
    conditions.salary !== "" || 
    conditions.mapsLink !== "" || 
    conditions.languages !== "" || 
    conditions.vacancyCount !== "" ||
    conditions.category !== "";

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = ""; 
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const isConfirmed = window.confirm("¿Estás seguro de que deseas cancelar? Se perderán todos los datos ingresados.");
      if (!isConfirmed) return;
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];
    if (allowedKeys.includes(e.key)) return;

    const isAlphanumericOrSpace = /^[a-zA-Z0-9\sñÑáéíóúÁÉÍÓÚ]+$/.test(e.key);
    if (!isAlphanumericOrSpace || conditions.title.length >= MAX_TITLE_CHARS) {
      e.preventDefault();
    }
  };

  const handleNumberKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];
    if (allowedKeys.includes(e.key)) return;

    const isNumber = /^[0-9]+$/.test(e.key);
    if (!isNumber) {
      e.preventDefault();
    }
  };

  const handleVacancyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      updateField("vacancyCount", "");
      return;
    }
    const num = parseInt(value, 10);
    if (num <= 500) {
      updateField("vacancyCount", num.toString());
    }
  };

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^\d-]/g, "");
    if (!rawValue) {
      updateField("salary", "");
      return;
    }
    const parts = rawValue.split("-");
    const formatMiles = (numStr: string) => {
      if (!numStr) return "";
      const numero = parseInt(numStr, 10);
      if (isNaN(numero)) return "";
      return numero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };
    let formatted = "Bs " + formatMiles(parts[0]);
    if (parts.length > 1) {
      formatted += " - " + formatMiles(parts[1]);
    }
    updateField("salary", formatted);
  };

  const handleSalaryBlur = () => validateField("salary");

  return (
    <div className="mt-6 rounded-xl border border-border bg-surface">
      <div className="border-b border-border px-6 py-4">
        <h2 className="text-[22px] font-bold text-ink">
          Informacion y condiciones de la oferta
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-5 px-6 py-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <div className="flex justify-between">
            <Label htmlFor="title" className="text-[12.5px] font-semibold">
              Titulo del puesto <span className="text-danger">*</span>
            </Label>
            <span className="text-[11px] text-slate-400">{conditions.title.length}/{MAX_TITLE_CHARS}</span>
          </div>
          <Input 
            id="title" 
            placeholder="Desarrollador Backend" 
            className="mt-1.5" 
            value={conditions.title} 
            onChange={(event) => updateField("title", event.target.value)}
            onKeyDown={handleTitleKeyDown}
            maxLength={MAX_TITLE_CHARS}
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? "title-error" : undefined}
          />
          <FieldError fieldId="title" message={errors.title} />
        </div>

        <div>
          <Label className="text-[12.5px] font-semibold">
            Modalidad  <span className="text-danger">*</span>
          </Label>
          <div id="modality" className="mt-1.5 grid grid-cols-3 gap-2">
            {MODALITIES.map((modality) => (
              <button
                key={modality}
                type="button"
                onClick={() => selectModality(modality)}
                className={conditions.modality === modality 
                  ? "rounded-md bg-ink px-3 py-2 text-sm font-semibold text-white" 
                  : "rounded-md border border-border px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-soft"}
                >{modality}
              </button>
            ))}
          </div>
          <FieldError fieldId="modality" message={errors.modality} />
        </div>

        <div>
          <Label htmlFor="mapsLink" className="text-[12.5px] font-semibold">
            Enlace de Google Maps <span className="text-danger">*</span>
          </Label>
          <Input
            id="mapsLink"
            placeholder="https://maps.google.com/?q=..."
            className="mt-1.5"
            value={conditions.mapsLink} 
            onChange={(event) => updateField("mapsLink" , event.target.value)}
            onBlur={() => validateField("mapsLink")}
            aria-invalid={Boolean(errors.mapsLink)}
            aria-describedby={errors.mapsLink ? "mapsLink-error" : undefined}
          />
          <FieldError fieldId="mapsLink" message={errors.mapsLink} />
        </div>

        <div>
          <Label htmlFor="contractType" className="text-[12.5px] font-semibold">
            Tipo de contrato <span className="text-danger">*</span>
          </Label>
          <Select value={conditions.contractType} onValueChange={(value) => updateField("contractType", value ?? "")}>
            <SelectTrigger id="contractType" className="mt-1.5 w-full">
              <SelectValue  placeholder="Selecciona una opcion" />
            </SelectTrigger>
            <SelectContent>
              {CONTRACT_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError fieldId="contractType" message={errors.contractType} />
        </div>

        <div>
          <Label htmlFor="category" className="text-[12.5px] font-semibold">
            Categoria <span className="text-danger">*</span>
          </Label>
          <Input 
            id="category" 
            placeholder="Tecnologia" 
            className="mt-1.5" 
            value={conditions.category} 
            onChange={(event) => updateField("category", event.target.value)} 
            aria-invalid={Boolean(errors.category)}
            aria-describedby={errors.category ? "category-error" : undefined}
          />
          <FieldError fieldId="category" message={errors.category} />
        </div>

        <div>
          <Label htmlFor="vacancyCount" className="text-[12.5px] font-semibold">
            Numero de vacantes <span className="text-danger">*</span>
          </Label>
          <Input 
            id="vacancyCount" 
            placeholder="1" 
            className="mt-1.5" 
            value={conditions.vacancyCount} 
            onChange={handleVacancyChange}
            onKeyDown={handleNumberKeyDown}
            inputMode="numeric"
            aria-invalid={Boolean(errors.vacancyCount)}
            aria-describedby={errors.vacancyCount ? "vacancyCount-error" : undefined}
          />
          <FieldError fieldId="vacancyCount" message={errors.vacancyCount} />
        </div>

        <div>
          <Label htmlFor="salary" className="text-[12.5px] font-semibold">
            Salario <span className="text-danger">*</span>
          </Label>
          <Input 
            id="salary" 
            placeholder="Bs 6.500 - 8.000" 
            className="mt-1.5" 
            value={conditions.salary} 
            onChange={handleSalaryChange}
            onBlur={handleSalaryBlur}
            aria-invalid={Boolean(errors.salary)}
            aria-describedby={errors.salary ? "salary-error" : undefined}
          />
          <FieldError fieldId="salary" message={errors.salary} />
        </div>

        <div>
          <Label htmlFor="languages" className="text-[12.5px] font-semibold">
            Idiomas <span className="text-danger">*</span>
          </Label>
          <Input 
            id="languages" 
            placeholder="Español, ingles intermedio" 
            className="mt-1.5"
            value={conditions.languages} 
            onChange={(event) => updateField("languages", event.target.value)} 
            maxLength={MAX_LANGUAGES_CHARS}
            aria-invalid={Boolean(errors.languages)}
            aria-describedby={errors.languages ? "languages-error" : undefined}
          />
          <FieldError fieldId="languages" message={errors.languages} />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border px-6 py-4">
        <button
          type="button"
          onClick={handleCancel}
          className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="rounded-lg bg-[#E50000] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}