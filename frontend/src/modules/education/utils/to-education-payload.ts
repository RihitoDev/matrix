import type { EducationFormValues } from "../types/education-form-values.types";
import type { EducationPayload } from "../types/education-payload.types";

export function toEducationPayload(values: EducationFormValues): EducationPayload {
  const description = (values.description ?? "").trim();
  return {
    institution: (values.institution ?? "").trim(),
    degree: (values.degree ?? "").trim(),
    startDate: values.startDate ?? "",
    endDate: values.endDate ?? "",
    description: description === "" ? null : description,
  };
}
