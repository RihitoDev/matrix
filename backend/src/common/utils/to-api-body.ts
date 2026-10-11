import type { ApiBodyOptions } from '@nestjs/swagger';
import { z, type ZodType } from 'zod';

// Documents a Zod request schema in Swagger: @ApiBody(toApiBody(schema)).
export function toApiBody(schema: ZodType): ApiBodyOptions {
  const { $schema: _dialect, ...jsonSchema } = z.toJSONSchema(schema, { io: 'input' });
  return { schema: jsonSchema } as ApiBodyOptions;
}
