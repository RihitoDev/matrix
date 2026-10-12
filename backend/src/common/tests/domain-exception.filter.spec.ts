import { describe, expect, it, vi } from 'vitest';
import type { ArgumentsHost } from '@nestjs/common';
import { DomainException } from '../exceptions/domain.exception.js';
import { RequestValidationException } from '../exceptions/request-validation.exception.js';
import { DomainExceptionFilter } from '../filters/domain-exception.filter.js';

class TestDomainException extends DomainException {
  constructor() {
    super('Error de prueba', 418);
  }
}

function buildHost() {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  const host = {
    switchToHttp: () => ({ getResponse: () => ({ status }) }),
  } as unknown as ArgumentsHost;

  return { host, status, json };
}

describe('DomainExceptionFilter', () => {
  it('responde con el formato estandar y el status de la excepcion', () => {
    const { host, status, json } = buildHost();

    new DomainExceptionFilter().catch(new TestDomainException(), host);

    expect(status).toHaveBeenCalledWith(418);
    expect(json).toHaveBeenCalledWith({
      statusCode: 418,
      data: null,
      detail: 'Error de prueba',
      ok: false,
    });
  });

  it('returns the structured validation errors in data', () => {
    const { host, status, json } = buildHost();
    const errors = [{ field: 'email', message: 'Invalid email' }];

    new DomainExceptionFilter().catch(new RequestValidationException(errors), host);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({
      statusCode: 400,
      data: errors,
      detail: 'email: Invalid email',
      ok: false,
      errors,
    });
  });
});
