"use client";

import type { ChangeEvent } from "react";
import { useAccessRequestForm } from "../contexts/access-request-context";
import type { PersonalDataFieldName } from "../types/access-request.types";

// Props comunes de los campos de texto: valor controlado, cambio y error propio
export function usePersonalDataBind() {
  const { values, fieldErrors, setValue } = useAccessRequestForm();

  return function bind(field: PersonalDataFieldName) {
    return {
      value: values[field],
      error: fieldErrors[field],
      onChange: (event: ChangeEvent<HTMLInputElement>) => setValue(field, event.target.value),
    };
  };
}
