import { Injectable, PipeTransform } from '@nestjs/common';
import type { ZodType } from 'zod';
import { RequestValidationException } from '../exceptions/request-validation.exception.js';

@Injectable()
export class RequestValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodType<T>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      throw new RequestValidationException(
        result.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      );
    }

    return result.data;
  }
}