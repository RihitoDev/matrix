import type { PresentationValues } from "./presentation-values.types";

export type PresentationPayload = Pick<PresentationValues, "headline" | "aboutMe">;
