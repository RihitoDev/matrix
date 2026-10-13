interface VacancyRank {
  careerMatch: boolean;
  experienceMatch: boolean;
  matchingSkills: number;
}

export function compareVacancyRank(
  left: VacancyRank,
  right: VacancyRank,
): number {
  return (
    Number(right.careerMatch) - Number(left.careerMatch) ||
    Number(right.experienceMatch) - Number(left.experienceMatch) ||
    right.matchingSkills - left.matchingSkills
  );
}
