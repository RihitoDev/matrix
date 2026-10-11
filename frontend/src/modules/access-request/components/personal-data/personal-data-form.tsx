"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Mail } from "lucide-react";
import { useAccessRequestForm } from "../../contexts/access-request-context";
import { usePersonalDataBind } from "../../hooks/use-personal-data-bind";
import type { PersonalDataFieldName } from "../../types/access-request.types";
import { CareerSelect } from "./career-select";
import { IdCardField } from "./id-card-field";
import { PersonalDataField } from "./personal-data-field";
import { PersonalDataFormActions } from "./personal-data-form-actions";
import { PersonalDataIntro } from "./personal-data-intro";

// Orden visual del formulario: el primer campo con error es el que recibe el foco
const FIELD_ORDER: readonly PersonalDataFieldName[] = [
  "firstName",
  "lastName",
  "idCardNumber",
  "idCardIssuedIn",
  "sisCode",
  "email",
  "phone",
  "birthDate",
  "graduationYear",
  "career",
];

export function PersonalDataForm() {
  const { fieldErrors, submit } = useAccessRequestForm();
  const bind = usePersonalDataBind();
  // Cada envío terminado incrementa el contador; el efecto enfoca el primer error solo cuando cambia
  const [submitCount, setSubmitCount] = useState(0);
  const handledCount = useRef(0);

  useEffect(() => {
    if (submitCount === handledCount.current) return;
    handledCount.current = submitCount;
    const firstWithError = FIELD_ORDER.find((field) => fieldErrors[field]);
    // Los ids de los controles (inputs y disparadores de los selects) son los nombres de los campos
    if (firstWithError) document.getElementById(firstWithError)?.focus();
  }, [submitCount, fieldErrors]);

  async function submitAndFocus() {
    await submit();
    setSubmitCount((count) => count + 1);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitAndFocus();
  }

  return (
    <div className="flex w-full flex-col gap-5">
      <PersonalDataIntro />

      <form noValidate onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:gap-x-8 2xl:gap-y-6">
        <PersonalDataField
          id="firstName"
          {...bind("firstName")}
          label="Nombres"
          isRequired
          autoComplete="given-name"
          placeholder="Ingresa tus nombres"
        />

        <PersonalDataField
          id="lastName"
          {...bind("lastName")}
          label="Apellidos"
          isRequired
          autoComplete="family-name"
          placeholder="Ingresa tus apellidos"
        />

        <IdCardField />

        <PersonalDataField
          id="sisCode"
          {...bind("sisCode")}
          label="Código SIS"
          isRequired
          help="Figura en tu carnet universitario o en tu kárdex."
          inputMode="numeric"
          maxLength={20}
          placeholder="Ej. 201904512"
        />

        <PersonalDataField
          id="email"
          {...bind("email")}
          label="Correo electrónico"
          isRequired
          help="Aquí te enviaremos el resultado y el código de activación."
          icon={<Mail aria-hidden="true" className="size-4" />}
          type="email"
          autoComplete="email"
          placeholder="correo@ejemplo.com"
        />

        <PersonalDataField
          id="phone"
          {...bind("phone")}
          label={
            <>
              Teléfono <span className="font-normal text-text-secondary">(opcional)</span>
            </>
          }
          type="tel"
          inputMode="tel"
          maxLength={8}
          autoComplete="tel"
          placeholder="Ej. 70712345"
        />

        <PersonalDataField
          id="birthDate"
          {...bind("birthDate")}
          label="Fecha de nacimiento"
          isRequired
          type="date"
          autoComplete="bday"
        />

        <PersonalDataField
          id="graduationYear"
          {...bind("graduationYear")}
          label="Año de titulación"
          isRequired
          inputMode="numeric"
          maxLength={4}
          placeholder="Ej. 2024"
        />

        <CareerSelect />

        <PersonalDataFormActions />
      </form>
    </div>
  );
}
