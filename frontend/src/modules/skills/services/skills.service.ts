import { apiClient } from "@/shared/services/api-client";
import {
  CUSTOM_SKILL_ENDPOINT,
  MY_SKILLS_ENDPOINT,
  SKILLS_CATALOG_ENDPOINT,
} from "../constants/skills.constants";
import type { ApiResponse } from "@/modules/profile/types/api-response.types";
import type { SkillItem } from "../types/skill-item.types";
import type { SkillResponse } from "../types/skill-response.types";
import { getAuthHeaders } from "@/modules/profile/utils/get-auth-headers";
import { toSkillItem } from "../utils/to-skill-item";

export const skillsService = {
  getCatalog: async (): Promise<SkillItem[]> => {
    const response = await apiClient.get<ApiResponse<SkillResponse[]>>(SKILLS_CATALOG_ENDPOINT, {
      headers: getAuthHeaders(),
    });
    return (response.data.data ?? []).map(toSkillItem);
  },

  getMySkills: async (): Promise<SkillItem[]> => {
    const response = await apiClient.get<ApiResponse<SkillResponse[]>>(MY_SKILLS_ENDPOINT, {
      headers: getAuthHeaders(),
    });
    return (response.data.data ?? []).map(toSkillItem);
  },

  createCustomSkill: async (name: string): Promise<SkillItem> => {
    const response = await apiClient.post<ApiResponse<SkillResponse>>(
      CUSTOM_SKILL_ENDPOINT,
      { name },
      { headers: getAuthHeaders() },
    );
    return toSkillItem(response.data.data);
  },

  saveMySkills: async (skillIds: string[]): Promise<SkillItem[]> => {
    const response = await apiClient.put<ApiResponse<SkillResponse[]>>(
      MY_SKILLS_ENDPOINT,
      { skillIds },
      { headers: getAuthHeaders() },
    );
    return (response.data.data ?? []).map(toSkillItem);
  },
};
