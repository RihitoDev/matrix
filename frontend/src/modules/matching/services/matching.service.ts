import type {
  AffinityAxis,
  AffinityAxisId,
  AxisScores,
  CandidateWithMatch,
  Vacancy,
} from "../types/matching-types";
import {
  AFFINITY_AXES,
  AXIS_MAX_SCORE,
  CANDIDATES_POOL,
  VACANCIES,
} from "../data/matching.data";

export function computeMatchPercent(candidate: AxisScores, target: AxisScores): number {
  const totalGap = AFFINITY_AXES.reduce(
    (sum, axis) => sum + Math.abs(candidate[axis.id] - target[axis.id]),
    0
  );
  const maxPossibleGap = AFFINITY_AXES.length * AXIS_MAX_SCORE;
  const percent = 100 - (totalGap / maxPossibleGap) * 100;
  return Math.max(0, Math.min(100, Math.round(percent)));
}

export function computeGaps(candidate: AxisScores, target: AxisScores): AxisScores {
  const gaps = {} as AxisScores;
  AFFINITY_AXES.forEach((axis) => {
    gaps[axis.id] = Math.round((candidate[axis.id] - target[axis.id]) * 10) / 10;
  });
  return gaps;
}

export function getAffinityAxes(): AffinityAxis[] {
  return AFFINITY_AXES;
}

export function getVacancies(): Vacancy[] {
  return VACANCIES;
}

export function getVacancyById(vacancyId: string): Vacancy | null {
  return VACANCIES.find((v) => v.id === vacancyId) ?? null;
}

export function getCandidatesForVacancy(vacancyId: string, query = ""): CandidateWithMatch[] {
  const vacancy = getVacancyById(vacancyId);
  if (!vacancy) return [];

  const normalizedQuery = query.trim().toLowerCase();

  return CANDIDATES_POOL.filter((candidate) =>
    normalizedQuery ? candidate.name.toLowerCase().includes(normalizedQuery) : true
  )
    .map<CandidateWithMatch>((candidate) => ({
      ...candidate,
      matchPercent: computeMatchPercent(candidate.scores, vacancy.targetProfile),
      gaps: computeGaps(candidate.scores, vacancy.targetProfile),
      status: "active",
    }))
    .sort((a, b) => b.matchPercent - a.matchPercent);
}

export function getAxisLabel(axisId: AffinityAxisId): string {
  return AFFINITY_AXES.find((axis) => axis.id === axisId)?.label ?? axisId;
}
