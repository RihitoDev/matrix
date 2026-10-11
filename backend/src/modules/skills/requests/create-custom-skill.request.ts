import { z } from 'zod';

export const createCustomSkillSchema = z.object({
  name: z.string().trim().min(1).max(100),
});

export type CreateCustomSkillRequest = z.infer<typeof createCustomSkillSchema>;
