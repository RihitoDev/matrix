import type { PersonalInfoValues } from "../types/personal-info-values.types";
import type { PresentationValues } from "../types/presentation-values.types";

export const EMPTY_PERSONAL_INFO_VALUES: PersonalInfoValues = {
  firstName: "",
  lastName: "",
  cityId: "",
  phone: "",
  personalEmail: "",
};

export const EMPTY_PRESENTATION_VALUES: PresentationValues = {
  headline: "",
  aboutMe: "",
  interestedOpportunities: "",
};
