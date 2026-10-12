import { Injectable } from '@nestjs/common';
import { CityNotFoundException } from '../exceptions/city-not-found.exception.js';
import { ProfileMapper } from '../mappers/profile.mapper.js';
import { CityRepository } from '../repositories/city.repository.js';
import type { ProfileCityResponse } from '../responses/profile-city.response.js';

@Injectable()
export class CityCatalogService {
  constructor(
    private readonly cityRepository: CityRepository,
    private readonly profileMapper: ProfileMapper,
  ) {}

  async listCities(): Promise<ProfileCityResponse[]> {
    const cities = await this.cityRepository.findAll();
    return cities.map((city) => this.profileMapper.toCityResponse(city));
  }

  async exists(cityId: string): Promise<boolean> {
    return this.cityRepository.exists(cityId);
  }

  async ensureCityExists(cityId: string): Promise<void> {
    const exists = await this.cityRepository.exists(cityId);
    if (!exists) {
      throw new CityNotFoundException();
    }
  }
}
