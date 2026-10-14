import { z } from 'zod';
import { SKILL_NAME_MAX_LENGTH } from '../constants/skill.constants.js';
import { formatSkillName } from '../utils/format-skill-name.js';

export const createCustomSkillSchema = z.object({
  name: z
    .string()
    .transform(formatSkillName)
    .pipe(
      z
        .string()
        .min(1)
        .max(SKILL_NAME_MAX_LENGTH)
        .regex(/^[\p{L}\p{N} +#.\-_/&()]+$/u, 'El nombre contiene caracteres no permitidos')
        .regex(/\p{L}/u, 'El nombre debe contener al menos una letra')
        .refine((name) => !/(.)\1{3,}/iu.test(name), 'El nombre no puede repetir el mismo carácter más de 3 veces seguidas'),
    ),
});

export type CreateCustomSkillRequest = z.infer<typeof createCustomSkillSchema>;
