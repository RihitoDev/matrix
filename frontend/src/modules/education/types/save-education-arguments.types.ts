import type { EducationPayload } from "./education-payload.types";
import type { UpdateEducationPayload } from "./update-education-payload.types";

export type SaveEducationArguments =
  | [payload: EducationPayload]
  | [payload: UpdateEducationPayload, id: string];
