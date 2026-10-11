import type { WorkExperienceItem } from "./work-experience-item.types";

export type WorkExperiencesResult =
  | { experiences: WorkExperienceItem[]; error: null }
  | { experiences: null; error: string };
