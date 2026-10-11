import type { WorkExperienceFormValues } from "../types/work-experience-form-values.types";
import type { WorkExperienceItem } from "../types/work-experience-item.types";

export function toWorkExperienceFormValues(experience: WorkExperienceItem): WorkExperienceFormValues {
  return {
    companyName: experience.companyName,
    position: experience.position,
    startDate: experience.startDate,
    endDate: experience.endDate ?? "",
    isCurrent: experience.isCurrent,
    description: experience.description ?? "",
  };
}
