import type { OrientationTypeResponse } from "./orientation-type-response.types";
import type { TechnicalAreaResponse } from "./technical-area-response.types";

export interface MentorProfile {
  id: string;
  fullName: string;
  headline: string | null;
  aboutMe: string | null;
  isAvailable: boolean;
  photoUrl: string | null;
  city: {
    id: string;
    title: string;
  } | null;
  educations: Array<{
    id: string;
    institution: string;
    degree: string;
    startDate: string;
    endDate: string | null;
    description: string | null;
  }>;
  workExperiences: Array<{
    id: string;
    position: string;
    startDate: string;
    endDate: string | null;
    isCurrent: boolean;
    description: string | null;
    company: {
      id: string;
      title: string;
    };
  }>;
  skills: Array<{
    id: string;
    name: string;
    isCustom: boolean;
  }>;
  certifications: Array<{
    id: string;
    name: string;
    issuingOrganization: string;
    issueDate: string;
    documentUrl: string | null;
  }>;
  technicalAreas: TechnicalAreaResponse[];
  orientationTypes: OrientationTypeResponse[];
}
