import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { ROLE_NAMES } from '../../../common/enums/roles.enum.js';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  roleTag: z.enum(ROLE_NAMES),
});

export class LoginDto extends createZodDto(loginSchema) {}
