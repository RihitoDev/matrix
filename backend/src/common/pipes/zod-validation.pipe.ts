import { PipeTransform } from '@nestjs/common';
import type { ZodType } from 'zod';
import { RequestValidationException } from '../exceptions/request-validation.exception.js';

export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodType) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new RequestValidationException(
        result.error.issues.map((issue) => ({
          field: issue.path.join('.') || 'valor',
          message: issue.message,
        })),
      );
    }
    return result.data;
  }
}
