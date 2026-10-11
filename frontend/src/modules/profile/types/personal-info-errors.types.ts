import type { PersonalInfoValues } from "./personal-info-values.types";

export type PersonalInfoErrors = Partial<Record<keyof PersonalInfoValues, string>>;
