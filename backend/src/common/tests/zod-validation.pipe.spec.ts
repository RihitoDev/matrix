import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { RequestValidationException } from '../exceptions/request-validation.exception.js';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe.js';

describe('ZodValidationPipe', () => {
  const schema = z.object({ name: z.string().min(1) });

  it('devuelve el valor parseado cuando es valido', () => {
    const pipe = new ZodValidationPipe(schema);
    expect(pipe.transform({ name: 'Derek' })).toEqual({ name: 'Derek' });
  });

  it('lanza RequestValidationException cuando el valor no es valido', () => {
    const pipe = new ZodValidationPipe(schema);
    expect(() => pipe.transform({ name: '' })).toThrow(RequestValidationException);
  });
});
