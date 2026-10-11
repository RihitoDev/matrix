import type { ArgumentsHost } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { DomainException } from '../../../common/exceptions/domain.exception.js';
import { DomainExceptionFilter } from '../../../common/filters/domain-exception.filter.js';
import { CityNotFoundException } from '../exceptions/city-not-found.exception.js';
import { PhotoNotFoundException } from '../exceptions/photo-not-found.exception.js';
import { ProfileNotFoundException } from '../exceptions/profile-not-found.exception.js';

describe('profile exceptions', () => {
  it.each([
    [new ProfileNotFoundException(), 404, 'User profile not found'],
    [new PhotoNotFoundException(), 404, 'Profile photo not found'],
    [new CityNotFoundException(), 404, 'City not found'],
  ])(
    '%o uses the expected status and English message',
    (exception, statusCode, message) => {
      expect(exception).toBeInstanceOf(DomainException);
      expect(exception.statusCode).toBe(statusCode);
      expect(exception.message).toBe(message);
    },
  );

  it('is formatted by the global filter as the standard error response', () => {
    const json = vi.fn();
    const status = vi.fn().mockReturnValue({ json });
    const host = {
      switchToHttp: () => ({ getResponse: () => ({ status }) }),
    } as unknown as ArgumentsHost;

    new DomainExceptionFilter().catch(new ProfileNotFoundException(), host);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({
      statusCode: 404,
      data: null,
      detail: 'User profile not found',
      ok: false,
    });
  });
});
