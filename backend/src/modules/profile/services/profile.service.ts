import { Injectable } from '@nestjs/common';
import { ProfileNotFoundException } from '../exceptions/profile-not-found.exception.js';
import { ProfileMapper } from '../mappers/profile.mapper.js';
import { ProfileRepository } from '../repositories/profile.repository.js';
import type { UpdatePersonalInfoRequest } from '../requests/update-personal-info.request.js';
import type { UpdatePresentationRequest } from '../requests/update-presentation.request.js';
import type { ProfileCityResponse } from '../responses/profile-city.response.js';
import type { ProfileResponse } from '../responses/profile.response.js';
import { CityCatalogService } from './city-catalog.service.js';

@Injectable()
export class ProfileService {
  constructor(
    private readonly profileRepository: ProfileRepository,
    private readonly cityCatalogService: CityCatalogService,
    private readonly profileMapper: ProfileMapper,
  ) {}

  async getProfile(userId: string): Promise<ProfileResponse> {
    const record = await this.profileRepository.findByUserId(userId);

    if (!record) {
      throw new ProfileNotFoundException();
    }

    return this.profileMapper.toResponse(record);
  }

  async updatePersonalInfo(
    userId: string,
    request: UpdatePersonalInfoRequest,
  ): Promise<ProfileResponse> {
    await this.ensureProfileExists(userId);
    await this.cityCatalogService.ensureCityExists(request.cityId);

    const record = await this.profileRepository.update(userId, request);
    return this.profileMapper.toResponse(record);
  }

  async updatePresentation(
    userId: string,
    request: UpdatePresentationRequest,
  ): Promise<ProfileResponse> {
    await this.ensureProfileExists(userId);

    const record = await this.profileRepository.update(userId, request);
    return this.profileMapper.toResponse(record);
  }

  async listCities(): Promise<ProfileCityResponse[]> {
    return this.cityCatalogService.listCities();
  }

  private async ensureProfileExists(userId: string): Promise<void> {
    const record = await this.profileRepository.findByUserId(userId);

    if (!record) {
      throw new ProfileNotFoundException();
    }
  }
}
