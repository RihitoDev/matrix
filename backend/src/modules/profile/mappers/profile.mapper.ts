import { Injectable } from '@nestjs/common';
import type { ProfileCityResponse } from '../responses/profile-city.response.js';
import type { ProfileResponse } from '../responses/profile.response.js';
import type { ProfileCityRecord } from '../types/profile-city-record.type.js';
import type { ProfileRecord } from '../types/profile-record.type.js';

@Injectable()
export class ProfileMapper {
  toResponse(record: ProfileRecord): ProfileResponse {
    return {
      id: record.id,
      firstName: record.firstName,
      lastName: record.lastName,
      institutionalEmail: record.email,
      personalEmail: record.personalEmail,
      phone: record.phone,
      city: record.city ? this.toCityResponse(record.city) : null,
      headline: record.headline,
      aboutMe: record.aboutMe,
      updatedAt: record.updatedAt.toISOString(),
    };
  }

  toCityResponse(city: ProfileCityRecord): ProfileCityResponse {
    return { id: city.id, title: city.title };
  }
}
