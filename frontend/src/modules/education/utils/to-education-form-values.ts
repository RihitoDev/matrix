import type { EducationFormValues } from "../types/education-form-values.types";
import type { EducationItem } from "../types/education-item.types";

export function toEducationFormValues(education: EducationItem): EducationFormValues {
  return {
    institution: education.institution ?? "",
    degree: education.degree ?? "",
    startDate: education.startDate?.slice(0, 10) ?? "",
    endDate: education.endDate ? education.endDate.slice(0, 10) : "",
    description: education.description ?? "",
  };
}
