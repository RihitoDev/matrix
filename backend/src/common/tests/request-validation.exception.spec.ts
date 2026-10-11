import { describe, expect, it, vi } from 'vitest';
import type { ArgumentsHost } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe.js';
import { RequestValidationException } from '../exceptions/request-validation.exception.js';
import { DomainExceptionFilter } from '../filters/domain-exception.filter.js';
describe('structured validation errors', () => {
  it('preserves individual fields and returns the standard 400 envelope', () => {
    const pipe = new ZodValidationPipe(
      z.object({ email: z.email(), name: z.string().min(1) }),
    );
    const json = vi.fn();
    const status = vi.fn().mockReturnValue({ json });
    const host = {
      switchToHttp: () => ({ getResponse: () => ({ status }) }),
    } as unknown as ArgumentsHost;
    try {
      pipe.transform({ email: 'invalid', name: '' });
      throw new Error('Expected validation failure');
    } catch (error) {
      expect(error).toBeInstanceOf(RequestValidationException);
      const exception = error as RequestValidationException;
      expect(exception.errors.map((issue) => issue.field)).toEqual([
        'email',
        'name',
      ]);
      new DomainExceptionFilter().catch(exception, host);
      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith(
        expect.objectContaining({
          ok: false,
          data: exception.errors,
          errors: exception.errors,
        }),
      );
    }
  });
});
