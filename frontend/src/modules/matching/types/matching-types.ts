
export type AffinityAxisId =
  | "desarrollo"
  | "cloud-devops"
  | "data-ai"
  | "qa"
  | "ciberseguridad"
  | "gobernanza-ti";

export interface AffinityAxis {
  id: AffinityAxisId;
  label: string;
}

export type AxisScores = Record<AffinityAxisId, number>;

export interface Candidate {
  id: string;
  name: string;
  role: string;
  technologies: string[];
  demoPhone: string;
  scores: AxisScores;
}

export interface Vacancy {
  id: string;
  title: string;
  targetProfile: AxisScores;
}

export type CandidateStatus = "active" | "discarded";

export interface CandidateWithMatch extends Candidate {
  matchPercent: number;
  gaps: AxisScores;
  status: CandidateStatus;
}

export type MatchingAction = "contact" | "schedule" | "discard" | null;
