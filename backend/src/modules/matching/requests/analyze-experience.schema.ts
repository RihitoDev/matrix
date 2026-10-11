import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const MAX_EXPERIENCE_TEXT_LENGTH = 5000;

export const analyzeExperienceParamsSchema = z.object({
  id: z.uuid({ error: 'El identificador de la experiencia no es valido' }),
});

export const analyzeExperienceBodySchema = z.object({
  text: z
    .string()
    .max(MAX_EXPERIENCE_TEXT_LENGTH, {
      error: `El texto no puede superar los ${MAX_EXPERIENCE_TEXT_LENGTH} caracteres`,
    })
    .nullish(),
});

export class AnalyzeExperienceParamsDto extends createZodDto(analyzeExperienceParamsSchema) {}
export class AnalyzeExperienceBodyDto extends createZodDto(analyzeExperienceBodySchema) {}
