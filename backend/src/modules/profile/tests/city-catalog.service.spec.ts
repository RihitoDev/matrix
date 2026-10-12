import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CityNotFoundException } from '../exceptions/city-not-found.exception.js';
import { ProfileMapper } from '../mappers/profile.mapper.js';
import type { CityRepository } from '../repositories/city.repository.js';
import { CityCatalogService } from '../services/city-catalog.service.js';

const cityId = '22222222-2222-4222-8222-222222222222';
const cityRecord = { id: cityId, title: 'Cochabamba' };

describe('CityCatalogService', () => {
  let service: CityCatalogService;
  let cityRepository: {
    findAll: ReturnType<typeof vi.fn>;
    exists: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    cityRepository = { findAll: vi.fn(), exists: vi.fn() };
    service = new CityCatalogService(
      cityRepository as unknown as CityRepository,
      new ProfileMapper(),
    );
  });

  describe('listCities', () => {
    it('returns the list of available cities mapped', async () => {
      cityRepository.findAll.mockResolvedValue([cityRecord]);

      const result = await service.listCities();

      expect(result).toEqual([{ id: cityId, title: 'Cochabamba' }]);
      expect(cityRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('exists', () => {
    it('returns true when the city exists', async () => {
      cityRepository.exists.mockResolvedValue(true);

      await expect(service.exists(cityId)).resolves.toBe(true);
      expect(cityRepository.exists).toHaveBeenCalledWith(cityId);
    });

    it('returns false when the city does not exist', async () => {
      cityRepository.exists.mockResolvedValue(false);

      await expect(service.exists('invalid-id')).resolves.toBe(false);
      expect(cityRepository.exists).toHaveBeenCalledWith('invalid-id');
    });
  });

  describe('ensureCityExists', () => {
    it('resolves without error when the city exists', async () => {
      cityRepository.exists.mockResolvedValue(true);

      await expect(service.ensureCityExists(cityId)).resolves.toBeUndefined();
    });

    it('throws CityNotFoundException when the city does not exist', async () => {
      cityRepository.exists.mockResolvedValue(false);

      await expect(service.ensureCityExists('invalid-id')).rejects.toBeInstanceOf(
        CityNotFoundException,
      );
    });
  });
});
