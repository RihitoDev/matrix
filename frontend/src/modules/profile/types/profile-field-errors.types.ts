import type { PersonalInfoValues } from "./personal-info-values.types";
import type { PresentationPayload } from "./presentation-payload.types";

export type ProfileFieldErrors = Partial<Record<keyof PersonalInfoValues | keyof PresentationPayload, string>>;
