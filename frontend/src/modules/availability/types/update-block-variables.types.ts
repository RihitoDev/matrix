import type { CreateAvailabilityBlockInput } from "./create-availability-block-input.types";

export interface UpdateBlockVariables {
  id: string;
  input: Partial<CreateAvailabilityBlockInput>;
}
