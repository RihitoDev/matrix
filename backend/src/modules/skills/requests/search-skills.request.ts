import { z } from 'zod';

export const searchSkillsSchema = z.object({
  search: z.string().trim().max(100).optional(),
});

export type SearchSkillsRequest = z.infer<typeof searchSkillsSchema>;
