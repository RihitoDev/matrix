import { apiClient } from "@/shared/services/api-client";
import type { ApiResponse } from "@/shared/types/api-response.types";
import type { SkillsAnalysisResult } from "@/modules/matching/types/skills-analysis.types";

export const skillsAnalysisService = {
  analyzeExperience: async (
    experienceId: string,
    text: string | null,
  ): Promise<SkillsAnalysisResult> => {
    const response = await apiClient.post<ApiResponse<SkillsAnalysisResult>>(
      `/work-experiences/${experienceId}/skills/analysis`,
      { text },
    );
    return response.data.data;
  },
};
