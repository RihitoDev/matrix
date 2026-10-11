import type { AvailabilityBlockState } from './availability-block-state.types.js';

export interface AvailabilityBlockResponse {
  id: string;
  mentorId: string;
  startAt: string;
  endAt: string;
  state: AvailabilityBlockState;
  createdAt: string;
  updatedAt: string;
}
