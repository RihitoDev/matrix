import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CityNotFoundException } from '../exceptions/city-not-found.exception.js';
import { ProfileNotFoundException } from '../exceptions/profile-not-found.exception.js';
import { ProfileMapper } from '../mappers/profile.mapper.js';
import type { ProfileRepository } from '../repositories/profile.repository.js';
import { CityCatalogService } from '../services/city-catalog.service.js';
import { ProfileService } from '../services/profile.service.js';
import type { ProfileRecord } from '../types/profile-record.type.js';

const userId = '11111111-1111-4111-8111-111111111111';
const cityId = '22222222-2222-4222-8222-222222222222';

const record: ProfileRecord = {
  id: userId,
  firstName: 'Valeria',
  lastName: 'Quispe',
  email: 'valeria.quispe@umss.edu.bo',
  personalEmail: 'valeria@mail.com',
  phone: '+591 70000000',
  headline: 'Junior web developer',
  aboutMe: 'Systems engineering graduate.',
  city: { id: cityId, title: 'Cochabamba' },
  updatedAt: new Date('2026-10-04T12:00:00.000Z'),
};

const personalInfo = {
  firstName: 'Valeria',
  lastName: 'Quispe',
  cityId,
  phone: '+591 70000000',
  personalEmail: 'valeria@mail.com',
};

describe('ProfileService', () => {
  let service: ProfileService;
  let profileRepository: {
    findByUserId: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  let cityCatalogService: {
    listCities: ReturnType<typeof vi.fn>;
    exists: ReturnType<typeof vi.fn>;
    ensureCityExists: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    profileRepository = { findByUserId: vi.fn(), update: vi.fn() };
    cityCatalogService = {
      listCities: vi.fn().mockResolvedValue([{ id: cityId, title: 'Cochabamba' }]),
      exists: vi.fn(),
      ensureCityExists: vi.fn().mockResolvedValue(undefined),
    };
    service = new ProfileService(
      profileRepository as unknown as ProfileRepository,
      cityCatalogService as unknown as CityCatalogService,
      new ProfileMapper(),
    );
  });

  describe('getProfile', () => {
    it('returns the mapped profile of the user', async () => {
      profileRepository.findByUserId.mockResolvedValue(record);

      const response = await service.getProfile(userId);

      expect(profileRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(response).toMatchObject({
        id: userId,
        institutionalEmail: 'valeria.quispe@umss.edu.bo',
        city: { id: cityId, title: 'Cochabamba' },
      });
    });

    it('throws when the user does not exist', async () => {
      profileRepository.findByUserId.mockResolvedValue(null);

      await expect(service.getProfile(userId)).rejects.toBeInstanceOf(ProfileNotFoundException);
    });
  });

  describe('updatePersonalInfo', () => {
    it('saves the personal info after checking the city', async () => {
      profileRepository.findByUserId.mockResolvedValue(record);
      cityCatalogService.ensureCityExists.mockResolvedValue(undefined);
      profileRepository.update.mockResolvedValue(record);

      const response = await service.updatePersonalInfo(userId, personalInfo);

      expect(cityCatalogService.ensureCityExists).toHaveBeenCalledWith(cityId);
      expect(profileRepository.update).toHaveBeenCalledWith(userId, personalInfo);
      expect(response.firstName).toBe('Valeria');
    });

    it('throws when the city does not exist', async () => {
      profileRepository.findByUserId.mockResolvedValue(record);
      cityCatalogService.ensureCityExists.mockRejectedValue(new CityNotFoundException());

      await expect(service.updatePersonalInfo(userId, personalInfo)).rejects.toBeInstanceOf(
        CityNotFoundException,
      );
      expect(profileRepository.update).not.toHaveBeenCalled();
    });

    it('throws when the user does not exist', async () => {
      profileRepository.findByUserId.mockResolvedValue(null);

      await expect(service.updatePersonalInfo(userId, personalInfo)).rejects.toBeInstanceOf(
        ProfileNotFoundException,
      );
      expect(profileRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('updatePresentation', () => {
    const presentation = { headline: 'Junior web developer', aboutMe: 'Graduate.' };

    it('saves the presentation', async () => {
      profileRepository.findByUserId.mockResolvedValue(record);
      profileRepository.update.mockResolvedValue({ ...record, aboutMe: 'Graduate.' });

      const response = await service.updatePresentation(userId, presentation);

      expect(profileRepository.update).toHaveBeenCalledWith(userId, presentation);
      expect(response.aboutMe).toBe('Graduate.');
    });

    it('throws when the user does not exist', async () => {
      profileRepository.findByUserId.mockResolvedValue(null);

      await expect(service.updatePresentation(userId, presentation)).rejects.toBeInstanceOf(
        ProfileNotFoundException,
      );
    });
  });

  it('lists the cities', async () => {
    cityCatalogService.listCities.mockResolvedValue([{ id: cityId, title: 'Cochabamba' }]);

    await expect(service.listCities()).resolves.toEqual([{ id: cityId, title: 'Cochabamba' }]);
    expect(cityCatalogService.listCities).toHaveBeenCalled();
  });
});
