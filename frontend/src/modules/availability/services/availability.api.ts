import { apiClient } from "@/shared/services/api-client";
import type { AvailabilityBlock } from "../types/availability-block.types";
import type { CreateAvailabilityBlockInput } from "../types/create-availability-block-input.types";
import type { AvailabilityFilters } from "../types/availability-filters.types";
import type { WeekRange } from "@/shared/types/week-range.types";

function toISOString(value: string): string {
  return new Date(value).toISOString();
}

export const availabilityApi = {
  getAvailabilityBlocks: async (filters?: AvailabilityFilters): Promise<AvailabilityBlock[]> => {
    const params = new URLSearchParams();
    if (filters?.from) params.append("from", toISOString(filters.from));
    if (filters?.to) params.append("to", toISOString(filters.to));
    const query = params.toString();
    const response = await apiClient.get<AvailabilityBlock[]>(`/availability-blocks${query ? `?${query}` : ""}`);
    return response.data;
  },

  getMentorFreeBlocks: async (mentorId: string, range: WeekRange): Promise<AvailabilityBlock[]> => {
    const params = new URLSearchParams({ from: range.startAt, to: range.endAt });
    const response = await apiClient.get<AvailabilityBlock[]>(
      `/mentors/${encodeURIComponent(mentorId)}/free-blocks?${params.toString()}`,
    );
    return response.data;
  },

  getAvailabilityBlockById: async (id: string): Promise<AvailabilityBlock> => {
    const response = await apiClient.get<AvailabilityBlock>(`/availability-blocks/${id}`);
    return response.data;
  },

  createAvailabilityBlock: async (input: CreateAvailabilityBlockInput): Promise<AvailabilityBlock> => {
    const payload: CreateAvailabilityBlockInput = {
      startAt: toISOString(input.startAt),
      endAt: toISOString(input.endAt),
    };
    const response = await apiClient.post<AvailabilityBlock>("/availability-blocks", payload);
    return response.data;
  },

  updateAvailabilityBlock: async (id: string, input: Partial<CreateAvailabilityBlockInput>): Promise<AvailabilityBlock> => {
    const payload: Partial<CreateAvailabilityBlockInput> = {};
    if (input.startAt) payload.startAt = toISOString(input.startAt);
    if (input.endAt) payload.endAt = toISOString(input.endAt);
    const response = await apiClient.patch<AvailabilityBlock>(`/availability-blocks/${encodeURIComponent(id)}`, payload);
    return response.data;
  },

  deleteAvailabilityBlock: async (id: string): Promise<void> => {
    await apiClient.delete(`/availability-blocks/${encodeURIComponent(id)}`);
  },
};
