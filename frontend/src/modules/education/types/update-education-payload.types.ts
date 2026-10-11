import type { EducationPayload } from "./education-payload.types";

export type UpdateEducationPayload = Omit<EducationPayload, "endDate"> & {
  endDate?: string;
};
