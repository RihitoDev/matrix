import { describe, expect, it } from 'vitest';
import { StreamableFile } from '@nestjs/common';
import type { CallHandler, ExecutionContext } from '@nestjs/common';
import { firstValueFrom, of, throwError } from 'rxjs';
import { ResponseInterceptor } from '../interceptors/index.js';
import { DomainException } from '../exceptions/domain.exception.js';

class TestDomainException extends DomainException {}

function buildContext(statusCode = 200): ExecutionContext {
  return {
    switchToHttp: () => ({
      getResponse: () => ({ statusCode }),
    }),
  } as unknown as ExecutionContext;
}

function buildCallHandler(value: unknown): CallHandler {
  return { handle: () => of(value) };
}

describe('ResponseInterceptor', () => {
  const interceptor = new ResponseInterceptor();

  it.each([200, 201, 202])(
    'envuelve los datos usando el status HTTP real %s',
    async (statusCode) => {
      const data = { id: 'mentor-1' };
      const result = await firstValueFrom(
        interceptor.intercept(buildContext(statusCode), buildCallHandler(data)),
      );

      expect(result).toEqual({
        statusCode,
        ok: true,
        detail: 'Operación exitosa',
        data,
      });
    },
  );

  it.each([
    { data: 'Hola' },
    { data: null },
    { data: [] },
    { data: [{ id: 'mentor-1' }] },
  ])('conserva el payload simple $data', async ({ data }) => {
    const result = await firstValueFrom(
      interceptor.intercept(buildContext(), buildCallHandler(data)),
    );

    expect(result).toEqual({
      statusCode: 200,
      ok: true,
      detail: 'Operación exitosa',
      data,
    });
  });

  it.each([
    { data: [{ id: '1' }], page: 2, offset: 10 },
    {
      data: { items: [{ id: '1' }], total: 10, limit: 5, totalPages: 2 },
      page: 2,
      offset: 5,
    },
  ])('promueve page y offset al nivel raiz: %j', async (paginated) => {
    const result = await firstValueFrom(
      interceptor.intercept(buildContext(), buildCallHandler(paginated)),
    );

    expect(result).toEqual({
      statusCode: 200,
      ok: true,
      detail: 'Operación exitosa',
      ...paginated,
    });
  });

  it('devuelve los archivos sin envolverlos', async () => {
    const file = new StreamableFile(Buffer.from('a,b'));
    const result = await firstValueFrom(
      interceptor.intercept(buildContext(), buildCallHandler(file)),
    );

    expect(result).toBe(file);
  });

  it('no vuelve a envolver respuestas ya formateadas', async () => {
    const formatted = {
      statusCode: 201,
      ok: true,
      detail: 'Creado',
      data: { id: 'abc' },
    };
    const result = await firstValueFrom(
      interceptor.intercept(buildContext(201), buildCallHandler(formatted)),
    );

    expect(result).toBe(formatted);
  });

  it('propaga la excepcion original para que la procese el filtro existente', async () => {
    const exception = new TestDomainException('Conflicto de dominio', 409);

    await expect(
      firstValueFrom(
        interceptor.intercept(buildContext(), {
          handle: () => throwError(() => exception),
        }),
      ),
    ).rejects.toBe(exception);
  });
});
