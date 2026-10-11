import type { EducationFormValues } from "../types/education-form-values.types";
import type { EducationItem } from "../types/education-item.types";
import type { UpdateEducationPayload } from "../types/update-education-payload.types";
import { toEducationPayload } from "./to-education-payload";

export function toEducationUpdatePayload(
  values: EducationFormValues,
  original: EducationItem,
): UpdateEducationPayload {
  const { endDate, ...fields } = toEducationPayload(values);
  return original.endDate === null && endDate === ""
    ? fields
    : { ...fields, endDate };
}
