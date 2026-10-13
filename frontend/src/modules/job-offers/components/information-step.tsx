"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  CONTRACT_TYPES,
  EDITING_KEYS,
  MAX_LANGUAGES_CHARS,
  MAX_TITLE_CHARS,
  MAX_VACANCIES,
  MODALITIES,
  TITLE_ALLOWED_REGEX,
  TITLE_DISALLOWED_CHARS_REGEX,
} from "../constants/vacancies.constants";
import type {
  Modality,
  UpdateVacancyField,
  VacancyConditions,
  VacancyErrors,
} from "../types/vacancy-conditions.types";
import { FieldError } from "./field-error";
import { StepActions } from "./step-actions";

interface InformationStepProps {
  conditions: VacancyConditions;
  errors: VacancyErrors;
  updateField: UpdateVacancyField;
  selectModality: (modality: Modality) => void;
  validateField: (field: keyof VacancyConditions) => void;
  onCancel: () => void;
  onContinue: () => void;
}

const THOUSANDS_SEPARATOR_REGEX = /\B(?=(\d{3})+(?!\d))/g;

function formatThousands(digits: string): string {
  if (!digits) return "";
  const amount = Number.parseInt(digits, 10);
  return Number.isNaN(amount) ? "" : amount.toString().replace(THOUSANDS_SEPARATOR_REGEX, ".");
}

export function InformationStep({
  conditions,
  errors,
  updateField,
  selectModality,
  validateField,
  onCancel,
  onContinue,
}: InformationStepProps) {
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = e.target.value.replace(TITLE_DISALLOWED_CHARS_REGEX, "").slice(0, MAX_TITLE_CHARS);
    updateField("title", sanitized);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (EDITING_KEYS.includes(e.key) || e.ctrlKey || e.metaKey) return;

    if (!TITLE_ALLOWED_REGEX.test(e.key) || conditions.title.length >= MAX_TITLE_CHARS) {
      e.preventDefault();
    }
  };

  const handleNumberKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (EDITING_KEYS.includes(e.key) || e.ctrlKey || e.metaKey) return;

    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleVacancyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "");
    if (digits === "") {
      updateField("vacancyCount", "");
      return;
    }
    const count = Number.parseInt(digits, 10);
    updateField("vacancyCount", Math.min(count, MAX_VACANCIES).toString());
  };

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^\d-]/g, "");
    if (!rawValue) {
      updateField("salary", "");
      return;
    }
    const [min, max] = rawValue.split("-");
    const formatted = rawValue.includes("-")
      ? `Bs ${formatThousands(min)} - ${formatThousands(max ?? "")}`
      : `Bs ${formatThousands(min)}`;
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
            onChange={handleTitleChange}
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
          <ToggleGroup
            id="modality"
            aria-label="Modalidad"
            value={conditions.modality ? [conditions.modality] : []}
            onValueChange={(values) => {
              const [next] = values;
              if (next) selectModality(next as Modality);
            }}
            className="mt-1.5 grid w-full grid-cols-3 gap-2"
          >
            {MODALITIES.map((modality) => (
              <ToggleGroupItem
                key={modality}
                value={modality}
                variant="outline"
                className="h-auto w-full rounded-md px-3 py-2 text-sm font-semibold text-ink data-[pressed]:border-ink data-[pressed]:bg-ink data-[pressed]:text-white"
              >
                {modality}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
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

      <StepActions
        secondaryLabel="Cancelar"
        primaryLabel="Continuar"
        onSecondary={onCancel}
        onPrimary={onContinue}
      />
    </div>
  );
}