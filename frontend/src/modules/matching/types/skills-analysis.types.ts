export interface DetectedSkill {
  id: string;
  name: string;
}

export interface SkillsAnalysisResult {
  experienceId: string;
  skills: DetectedSkill[];
  processingTimeMs: number;
}
