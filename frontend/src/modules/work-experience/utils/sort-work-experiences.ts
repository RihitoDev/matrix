import type { WorkExperienceItem } from "../types/work-experience-item.types";

export function sortWorkExperiences(experiences: WorkExperienceItem[]): WorkExperienceItem[] {
  return [...experiences].sort((first, second) => {
    if (first.isCurrent !== second.isCurrent) {
      return first.isCurrent ? -1 : 1;
    }
    return second.startDate.localeCompare(first.startDate);
  });
}