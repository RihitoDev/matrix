import type { WorkExperienceFormValues } from "./work-experience-form-values.types";

export type WorkExperienceErrors = Partial<Record<keyof WorkExperienceFormValues, string>>;
