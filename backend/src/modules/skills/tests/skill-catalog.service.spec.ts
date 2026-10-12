import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SkillMapper } from '../mappers/skill.mapper.js';
import type { SkillRepository } from '../repositories/skill.repository.js';
import { SkillCatalogService } from '../services/skill-catalog.service.js';

const pythonId = '33333333-3333-4333-8333-333333333333';
const sqlId = '44444444-4444-4444-8444-444444444444';

const python = { id: pythonId, name: 'Python', isCustom: false };
const sql = { id: sqlId, name: 'SQL', isCustom: false };

describe('SkillCatalogService', () => {
  let service: SkillCatalogService;
  let skillRepository: {
    findCatalog: ReturnType<typeof vi.fn>;
    findByName: ReturnType<typeof vi.fn>;
    createCustom: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    skillRepository = {
      findCatalog: vi.fn(),
      findByName: vi.fn(),
      createCustom: vi.fn(),
    };
    service = new SkillCatalogService(
      skillRepository as unknown as SkillRepository,
      new SkillMapper(),
    );
  });

  describe('listCatalog', () => {
    it('returns the catalog filtered by the search term', async () => {
      skillRepository.findCatalog.mockResolvedValue([python]);

      await expect(service.listCatalog({ search: 'py' })).resolves.toEqual([python]);
      expect(skillRepository.findCatalog).toHaveBeenCalledWith('py');
    });

    it('returns the whole catalog when the search term is empty', async () => {
      skillRepository.findCatalog.mockResolvedValue([python, sql]);

      await expect(service.listCatalog({ search: '' })).resolves.toEqual([python, sql]);
      expect(skillRepository.findCatalog).toHaveBeenCalledWith(undefined);
    });
  });

  describe('createCustomSkill', () => {
    it('creates a custom skill when the name does not exist', async () => {
      const kubernetes = { id: sqlId, name: 'Kubernetes', isCustom: true };
      skillRepository.findByName.mockResolvedValue(null);
      skillRepository.createCustom.mockResolvedValue(kubernetes);

      await expect(service.createCustomSkill({ name: 'Kubernetes' })).resolves.toEqual(kubernetes);
      expect(skillRepository.findByName).toHaveBeenCalledWith('Kubernetes');
      expect(skillRepository.createCustom).toHaveBeenCalledWith('Kubernetes');
    });

    it('reuses the existing skill when the name is already in the catalog', async () => {
      skillRepository.findByName.mockResolvedValue(python);

      await expect(service.createCustomSkill({ name: 'python' })).resolves.toEqual(python);
      expect(skillRepository.createCustom).not.toHaveBeenCalled();
    });
  });
});
