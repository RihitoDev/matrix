import type { ProfileCityRecord } from './profile-city-record.type.js';

export interface ProfileRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  personalEmail: string | null;
  phone: string | null;
  headline: string | null;
  aboutMe: string | null;
  city: ProfileCityRecord | null;
  updatedAt: Date;
}
