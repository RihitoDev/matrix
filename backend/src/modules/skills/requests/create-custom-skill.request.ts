import { z } from 'zod';
import {
  SKILL_NAME_ALLOWED_CHARACTERS_REGEX,
  SKILL_NAME_LETTER_REGEX,
  SKILL_NAME_MAX_LENGTH,
  SKILL_NAME_REPEATED_CHARACTER_REGEX,
} from '../constants/skill.constants.js';
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
        .regex(SKILL_NAME_ALLOWED_CHARACTERS_REGEX, 'El nombre contiene caracteres no permitidos')
        .regex(SKILL_NAME_LETTER_REGEX, 'El nombre debe contener al menos una letra')
        .refine((name) => !SKILL_NAME_REPEATED_CHARACTER_REGEX.test(name), 'El nombre no puede repetir el mismo carácter más de 3 veces seguidas'),
    ),
});

export type CreateCustomSkillRequest = z.infer<typeof createCustomSkillSchema>;
