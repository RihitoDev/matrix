import type { EducationItem } from "./education-item.types";

export type EducationsResult =
  | { educations: EducationItem[]; error: null }
  | { educations: null; error: string };
