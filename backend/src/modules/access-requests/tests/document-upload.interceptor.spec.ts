import { PayloadTooLargeException, BadRequestException } from '@nestjs/common';
import { lastValueFrom, of, throwError } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { FileTooLargeException } from '../../files/exceptions/index.js';
import { DocumentUploadInterceptor } from '../interceptors/document-upload.interceptor.js';

describe('DocumentUploadInterceptor', () => {
  const interceptor = new DocumentUploadInterceptor();
  const run = (handle: () => ReturnType<typeof of>) => lastValueFrom(interceptor.intercept({} as any, { handle } as any));

  it('convierte PayloadTooLargeException en FileTooLargeException (413)', async () => {
    const error = await run(() => throwError(() => new PayloadTooLargeException())).catch((e) => e);

    expect(error).toBeInstanceOf(FileTooLargeException);
    expect(error.statusCode).toBe(413);
    expect(error.message).toBe('El archivo no puede superar los 10 MB');
  });

  it('relanza otros errores sin cambios', async () => {
    const boom = new BadRequestException('x');

    await expect(run(() => throwError(() => boom))).rejects.toBe(boom);
  });

  it('deja pasar las respuestas normales', async () => {
    await expect(run(() => of({ id: 'id-1' }))).resolves.toEqual({ id: 'id-1' });
  });
});
