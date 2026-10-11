import type { DocumentState } from "../types/access-request-context.types";
import type { PersonalDataValues } from "../types/access-request.types";

export const EMPTY_VALUES: PersonalDataValues = {
  firstName: "",
  lastName: "",
  idCardNumber: "",
  idCardIssuedIn: "",
  sisCode: "",
  email: "",
  phone: "",
  birthDate: "",
  graduationYear: "",
  career: "",
};

export const EMPTY_DOCUMENT: DocumentState = {
  documentType: null,
  fileName: null,
  fileSize: null,
  mimeType: null,
  previewUrl: null,
  progress: 0,
  error: null,
};
