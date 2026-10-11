import type { PresentationValues } from "./presentation-values.types";

export type PresentationErrors = Partial<Record<keyof PresentationValues, string>>;
