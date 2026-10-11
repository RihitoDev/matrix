import type { ProfileCityResponse } from './profile-city.response.js';

export interface ProfileResponse {
  id: string;
  firstName: string;
  lastName: string;
  institutionalEmail: string;
  personalEmail: string | null;
  phone: string | null;
  city: ProfileCityResponse | null;
  headline: string | null;
  aboutMe: string | null;
  updatedAt: string;
}
