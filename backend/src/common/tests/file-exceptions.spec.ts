import type { ArgumentsHost } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { CORRUPTED_FILE_ERROR_CODE } from '../constants/file-error-codes.constants.js';
import { CorruptedFileException } from '../exceptions/corrupted-file.exception.js';
import { DomainException } from '../exceptions/domain.exception.js';
import { EmptyFileException } from '../exceptions/empty-file.exception.js';
import { FileTooLargeException } from '../exceptions/file-too-large.exception.js';
import { InvalidFileTypeException } from '../exceptions/invalid-file-type.exception.js';
import { DomainExceptionFilter } from '../filters/domain-exception.filter.js';

describe('file exceptions', () => {
  it.each([
    [new EmptyFileException(), 400, 'File is required and cannot be empty'],
    [new FileTooLargeException(), 413, 'File exceeds the maximum allowed size'],
    [new InvalidFileTypeException(), 415, 'File type is not allowed'],
    [
      new CorruptedFileException(),
      400,
      'File content is incomplete or corrupted',
    ],
  ])(
    '%o uses the expected status and English message',
    (exception, statusCode, message) => {
      expect(exception).toBeInstanceOf(DomainException);
      expect(exception.statusCode).toBe(statusCode);
      expect(exception.message).toBe(message);
    },
  );

  it('exposes a stable error code for corrupted files', () => {
    expect(new CorruptedFileException().data).toEqual({
      code: CORRUPTED_FILE_ERROR_CODE,
    });
    expect(new EmptyFileException().data).toBeNull();
  });

  it('formats a corrupted file with status 400 and its error code', () => {
    const json = vi.fn();
    const status = vi.fn().mockReturnValue({ json });
    const host = {
      switchToHttp: () => ({ getResponse: () => ({ status }) }),
    } as unknown as ArgumentsHost;

    new DomainExceptionFilter().catch(new CorruptedFileException(), host);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({
      statusCode: 400,
      data: { code: CORRUPTED_FILE_ERROR_CODE },
      detail: 'File content is incomplete or corrupted',
      ok: false,
    });
  });

  it('is formatted by the global filter as the standard error response', () => {
    const json = vi.fn();
    const status = vi.fn().mockReturnValue({ json });
    const host = {
      switchToHttp: () => ({ getResponse: () => ({ status }) }),
    } as unknown as ArgumentsHost;

    new DomainExceptionFilter().catch(new FileTooLargeException(), host);

    expect(status).toHaveBeenCalledWith(413);
    expect(json).toHaveBeenCalledWith({
      statusCode: 413,
      data: null,
      detail: 'File exceeds the maximum allowed size',
      ok: false,
    });
  });
});
