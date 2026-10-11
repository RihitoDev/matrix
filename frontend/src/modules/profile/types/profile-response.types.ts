import type { CityOption } from "./city-option.types";

export interface ProfileResponse {
  id: string;
  firstName: string;
  lastName: string;
  institutionalEmail: string;
  personalEmail: string | null;
  phone: string | null;
  city: CityOption | null;
  headline: string | null;
  aboutMe: string | null;
  updatedAt: string;
}
