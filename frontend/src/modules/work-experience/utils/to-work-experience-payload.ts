import type { WorkExperienceFormValues } from "../types/work-experience-form-values.types";
import type { WorkExperiencePayload } from "../types/work-experience-payload.types";

export function toWorkExperiencePayload(values: WorkExperienceFormValues): WorkExperiencePayload {
  const description = values.description.trim();
  return {
    companyName: values.companyName.trim(),
    position: values.position.trim(),
    startDate: values.startDate,
    endDate: values.isCurrent || !values.endDate ? null : values.endDate,
    isCurrent: values.isCurrent,
    description: description === "" ? null : description,
  };
}
