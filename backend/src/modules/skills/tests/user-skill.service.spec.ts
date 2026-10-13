import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProfileNotFoundException } from '../../profile/exceptions/profile-not-found.exception.js';
import type { ProfileRepository } from '../../profile/repositories/profile.repository.js';
import { DuplicateSkillException } from '../exceptions/duplicate-skill.exception.js';
import { SkillNotFoundException } from '../exceptions/skill-not-found.exception.js';
import { SkillMapper } from '../mappers/skill.mapper.js';
import type { SkillRepository } from '../repositories/skill.repository.js';
import type { UserSkillRepository } from '../repositories/user-skill.repository.js';
import { UserSkillService } from '../services/user-skill.service.js';

const userId = '11111111-1111-4111-8111-111111111111';
const pythonId = '33333333-3333-4333-8333-333333333333';
const sqlId = '44444444-4444-4444-8444-444444444444';

const python = { id: pythonId, name: 'Python', isCustom: false };
const sql = { id: sqlId, name: 'SQL', isCustom: false };

describe('UserSkillService', () => {
  let service: UserSkillService;
  let skillRepository: { findByIds: ReturnType<typeof vi.fn> };
  let userSkillRepository: {
    findByUserId: ReturnType<typeof vi.fn>;
    replaceForUser: ReturnType<typeof vi.fn>;
  };
  let profileRepository: { findByUserId: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    skillRepository = { findByIds: vi.fn() };
    userSkillRepository = { findByUserId: vi.fn(), replaceForUser: vi.fn() };
    profileRepository = { findByUserId: vi.fn().mockResolvedValue({ id: userId }) };
    service = new UserSkillService(
      userSkillRepository as unknown as UserSkillRepository,
      skillRepository as unknown as SkillRepository,
      profileRepository as unknown as ProfileRepository,
      new SkillMapper(),
    );
  });

  describe('getUserSkills', () => {
    it('returns the skills of the token user', async () => {
      userSkillRepository.findByUserId.mockResolvedValue([{ skill: python }]);

      await expect(service.getUserSkills(userId)).resolves.toEqual([python]);
      expect(userSkillRepository.findByUserId).toHaveBeenCalledWith(userId);
    });

    it('fails when the user does not exist', async () => {
      profileRepository.findByUserId.mockResolvedValue(null);

      await expect(service.getUserSkills(userId)).rejects.toBeInstanceOf(ProfileNotFoundException);
      expect(userSkillRepository.findByUserId).not.toHaveBeenCalled();
    });
  });

  describe('updateUserSkills', () => {
    it('replaces the skills of the token user', async () => {
      skillRepository.findByIds.mockResolvedValue([python, sql]);
      userSkillRepository.replaceForUser.mockResolvedValue([{ skill: python }, { skill: sql }]);

      await expect(
        service.updateUserSkills(userId, { skillIds: [pythonId, sqlId] }),
      ).resolves.toEqual([python, sql]);
      expect(userSkillRepository.replaceForUser).toHaveBeenCalledWith(userId, [pythonId, sqlId]);
    });

    it('allows removing every skill with an empty list', async () => {
      skillRepository.findByIds.mockResolvedValue([]);
      userSkillRepository.replaceForUser.mockResolvedValue([]);

      await expect(service.updateUserSkills(userId, { skillIds: [] })).resolves.toEqual([]);
      expect(userSkillRepository.replaceForUser).toHaveBeenCalledWith(userId, []);
    });

    it('rejects the same skill twice', async () => {
      await expect(
        service.updateUserSkills(userId, { skillIds: [pythonId, pythonId] }),
      ).rejects.toBeInstanceOf(DuplicateSkillException);
      expect(userSkillRepository.replaceForUser).not.toHaveBeenCalled();
    });

    it('rejects a skill that does not exist', async () => {
      skillRepository.findByIds.mockResolvedValue([python]);

      await expect(
        service.updateUserSkills(userId, { skillIds: [pythonId, sqlId] }),
      ).rejects.toBeInstanceOf(SkillNotFoundException);
      expect(userSkillRepository.replaceForUser).not.toHaveBeenCalled();
    });

    it('fails when the user does not exist', async () => {
      profileRepository.findByUserId.mockResolvedValue(null);

      await expect(
        service.updateUserSkills(userId, { skillIds: [pythonId] }),
      ).rejects.toBeInstanceOf(ProfileNotFoundException);
      expect(skillRepository.findByIds).not.toHaveBeenCalled();
    });
  });
});
