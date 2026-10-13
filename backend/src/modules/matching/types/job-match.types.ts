import type { RequirementState } from './requirement-state.types.js';

export interface JobMatchResponse {
  jobOfferId: string;
  title: string;
  companyName: string;
  modality: string;
  description: string;
  score: number;
  requirements: RequirementState[];
  hasPendingRequirements: boolean;
}

export interface RecommendedJobResponse {
  jobOfferId: string;
  title: string;
  companyName: string;
  modality: string;
  score: number;
  matchedSkills: string[];
  skills: string[];
}

export interface RecommendationsResponse {
  isProfileComplete: boolean;
  items: RecommendedJobResponse[];
}