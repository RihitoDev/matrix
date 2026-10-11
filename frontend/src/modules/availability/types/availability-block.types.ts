import type { AvailabilityBlockState } from "./availability-block-state.types";

export interface AvailabilityBlock {
  id: string;
  mentorId: string;
  startAt: string;
  endAt: string;
  state: AvailabilityBlockState;
  createdAt: string;
  updatedAt: string;
}
