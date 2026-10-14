import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const mentorParamsSchema = z.strictObject({
  id: z.uuid({ error: 'El identificador del mentor no es válido' }),
});

export class MentorParamsDto extends createZodDto(mentorParamsSchema) {}
