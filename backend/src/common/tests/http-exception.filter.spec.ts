import { describe, it, expect, vi } from 'vitest';
import {
  BadRequestException,
  HttpException,
  NotFoundException,
} from '@nestjs/common';
import type { ArgumentsHost } from '@nestjs/common';
import { HttpExceptionFilter } from '../filters/http-exception.filter.js';

const buildHost = () => {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  const host = {
    switchToHttp: () => ({ getResponse: () => ({ status }) }),
  } as unknown as ArgumentsHost;
  return { host, status, json };
};

describe('HttpExceptionFilter', () => {
  const filter = new HttpExceptionFilter();

  it('convierte un error de validación en 422 con el detalle por campo', () => {
    const { host, status, json } = buildHost();
    const detalles = [
      { campo: 'tituloPuesto', codigo: 'too_big', mensaje: 'Muy largo' },
    ];

    filter.catch(
      new BadRequestException({ error: 'VALIDATION_ERROR', detalles }),
      host,
    );

    expect(status).toHaveBeenCalledWith(422);
    expect(json).toHaveBeenCalledWith({
      statusCode: 422,
      data: null,
      detail: detalles,
      ok: false,
    });
  });

  it('mantiene el 400 si no es un error de validación de Zod', () => {
    const { host, status, json } = buildHost();

    filter.catch(new BadRequestException('Petición inválida'), host);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({
      statusCode: 400,
      data: null,
      detail: 'Petición inválida',
      ok: false,
    });
  });

  it('mantiene el 400 si detalles no es una lista', () => {
    const { host, status, json } = buildHost();

    filter.catch(
      new BadRequestException({
        error: 'VALIDATION_ERROR',
        detalles: 'no es lista',
      }),
      host,
    );

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ detail: 'Error inesperado.', ok: false }),
    );
  });

  it('devuelve el estado y el mensaje de otros errores HTTP', () => {
    const { host, status, json } = buildHost();

    filter.catch(new NotFoundException('No existe'), host);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ detail: 'No existe', ok: false }),
    );
  });

  it('usa un mensaje genérico si el error no trae mensaje', () => {
    const { host, status, json } = buildHost();

    filter.catch(new HttpException({}, 500), host);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ detail: 'Error inesperado.' }),
    );
  });

  it('usa un mensaje genérico si la respuesta del error es un texto', () => {
    const { host, status, json } = buildHost();

    filter.catch(new HttpException('texto', 403), host);

    expect(status).toHaveBeenCalledWith(403);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ detail: 'Error inesperado.' }),
    );
  });
});