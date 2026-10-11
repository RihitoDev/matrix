import { z } from 'zod';
import { MAX_USER_SKILLS } from '../constants/skill.constants.js';

export const updateUserSkillsSchema = z.object({
  skillIds: z.array(z.uuid()).max(MAX_USER_SKILLS),
});

export type UpdateUserSkillsRequest = z.infer<typeof updateUserSkillsSchema>;
