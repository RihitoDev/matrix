import type { CreateAvailabilityBlockInput } from "./create-availability-block-input.types";

export type BlockValidationErrors = Partial<Record<keyof CreateAvailabilityBlockInput, string>>;
