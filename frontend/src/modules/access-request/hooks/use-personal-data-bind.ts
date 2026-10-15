"use client";

import type { ChangeEvent } from "react";
import { useAccessRequestForm } from "../contexts/access-request-context";
import { DIGIT_ONLY_FIELDS } from "../constants/personal-data-rules.constants";
import type { PersonalDataFieldName } from "../types/access-request.types";

function isDigitOnly(field: PersonalDataFieldName): boolean {
  return (DIGIT_ONLY_FIELDS as readonly string[]).includes(field);
}

export function usePersonalDataBind() {
  const { values, fieldErrors, setValue } = useAccessRequestForm();

  return function bind(field: PersonalDataFieldName) {
    return {
      value: values[field],
      error: fieldErrors[field],
      onChange: (event: ChangeEvent<HTMLInputElement>) =>
        setValue(field, isDigitOnly(field) ? event.target.value.replace(/\D/g, "") : event.target.value),
    };
  };
}
