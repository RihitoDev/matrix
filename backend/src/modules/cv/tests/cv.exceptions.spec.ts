import type { ArgumentsHost } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { DomainException } from '../../../common/exceptions/domain.exception.js';
import { DomainExceptionFilter } from '../../../common/filters/domain-exception.filter.js';
import { CvNotFoundException } from '../exceptions/cv-not-found.exception.js';

describe('cv exceptions', () => {
  it('CvNotFoundException uses 404 and expected message', () => {
    const exception = new CvNotFoundException();
    expect(exception).toBeInstanceOf(DomainException);
    expect(exception.statusCode).toBe(404);
    expect(exception.message).toBe('CV not found');
  });

  it('is formatted by the global filter as the standard error response', () => {
    const json = vi.fn();
    const status = vi.fn().mockReturnValue({ json });
    const host = {
      switchToHttp: () => ({ getResponse: () => ({ status }) }),
    } as unknown as ArgumentsHost;

    new DomainExceptionFilter().catch(new CvNotFoundException(), host);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({
      statusCode: 404,
      data: null,
      detail: 'CV not found',
      ok: false,
    });
  });
});
