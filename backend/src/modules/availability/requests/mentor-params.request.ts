import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { MENTOR_PARAMS_MESSAGES } from '../constants/mentor-params.constants.js';

export const mentorParamsSchema = z.strictObject({
  id: z.uuid({ error: MENTOR_PARAMS_MESSAGES.invalidId }),
});

export class MentorParamsDto extends createZodDto(mentorParamsSchema) {}
