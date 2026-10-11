import { describe, expect, it, vi } from 'vitest';
import { Prisma } from '../../../prisma/client.js';
import { AccessRequestsRepository } from '../repositories/access-requests.repository.js';
import {
  AccessRequestCatalogMissingException,
  AccessRequestNotFoundException,
  ActiveAccessRequestExistsException,
  RequestCodeGenerationException,
} from '../exceptions/index.js';
import { MAX_REQUEST_CODE_ATTEMPTS } from '../constants/request-code.constants.js';

function build() {
  const accessRequest = { findFirst: vi.fn(), update: vi.fn() };
  const repository = new AccessRequestsRepository({ accessRequest } as any);
  // Sin esperas reales en las pruebas
  const pause = vi.fn().mockResolvedValue(undefined);
  repository.retryPause = pause;
  return { accessRequest, pause, repository };
}

const prismaError = (code: string, meta?: Record<string, unknown>) =>
  new Prisma.PrismaClientKnownRequestError('boom', { code, clientVersion: 'test', meta });

describe('AccessRequestsRepository: envío y consulta de estado', () => {
  describe('generateRequestCode', () => {
    it('consulta por prefijo del año UTC en orden descendente y suma uno', async () => {
      const { accessRequest, repository } = build();
      accessRequest.findFirst.mockResolvedValue({ requestCode: 'SOL-2026-0148' });

      await expect(repository.generateRequestCode(new Date('2026-10-05T12:00:00Z'))).resolves.toBe('SOL-2026-0149');

      expect(accessRequest.findFirst).toHaveBeenCalledWith({
        where: { requestCode: { startsWith: 'SOL-2026-' } },
        orderBy: { requestCode: 'desc' },
        select: { requestCode: true },
      });
    });

    it('el primer código del año es 0001 y el año cambia el prefijo', async () => {
      const { accessRequest, repository } = build();
      accessRequest.findFirst.mockResolvedValue(null);

      await expect(repository.generateRequestCode(new Date('2027-01-01T00:00:00Z'))).resolves.toBe('SOL-2027-0001');
      expect(accessRequest.findFirst.mock.calls[0][0].where.requestCode.startsWith).toBe('SOL-2027-');
    });

    it('usa el año UTC (31 de diciembre al final del día sigue siendo el mismo año)', async () => {
      const { accessRequest, repository } = build();
      accessRequest.findFirst.mockResolvedValue(null);

      await expect(repository.generateRequestCode(new Date('2026-12-31T23:59:59Z'))).resolves.toBe('SOL-2026-0001');
    });
  });

  describe('submit', () => {
    it('actualiza solo borradores, conecta el estado pending por título y fija código y fecha', async () => {
      const { accessRequest, repository } = build();
      accessRequest.update.mockResolvedValue({ id: 'id-1' });

      await repository.submit('id-1', 'SOL-2026-0001');

      const args = accessRequest.update.mock.calls[0][0];
      expect(args.where).toEqual({ id: 'id-1', status: { title: 'draft' } });
      expect(args.data.requestCode).toBe('SOL-2026-0001');
      expect(args.data.submittedAt).toBeInstanceOf(Date);
      expect(args.data.status).toEqual({ connect: { title: 'pending' } });
      expect(args.select).toEqual({ id: true, requestCode: true, submittedAt: true, status: { select: { title: true } } });
    });

    it('P2025 sin meta.model lanza 404', async () => {
      const { accessRequest, repository } = build();
      accessRequest.update.mockRejectedValue(prismaError('P2025'));

      await expect(repository.submit('id-1', 'SOL-2026-0001')).rejects.toBeInstanceOf(AccessRequestNotFoundException);
    });

    it('P2025 con meta.model lanza catálogo faltante', async () => {
      const { accessRequest, repository } = build();
      accessRequest.update.mockRejectedValue(prismaError('P2025', { model: 'AccessRequestStatus' }));

      await expect(repository.submit('id-1', 'SOL-2026-0001')).rejects.toBeInstanceOf(AccessRequestCatalogMissingException);
    });

    it('relanza cualquier otro error igual', async () => {
      const { accessRequest, repository } = build();
      const boom = new Error('db caída');
      accessRequest.update.mockRejectedValue(boom);

      await expect(repository.submit('id-1', 'SOL-2026-0001')).rejects.toBe(boom);
    });
  });

  describe('submitWithGeneratedCode', () => {
    it('envía con el código generado a la primera', async () => {
      const { accessRequest, repository } = build();
      accessRequest.findFirst.mockResolvedValue({ requestCode: 'SOL-2026-0001' });
      accessRequest.update.mockResolvedValue({ id: 'id-1', requestCode: 'SOL-2026-0002' });

      await repository.submitWithGeneratedCode('id-1');

      expect(accessRequest.update).toHaveBeenCalledTimes(1);
      expect(accessRequest.update.mock.calls[0][0].data.requestCode).toMatch(/^SOL-\d{4}-0002$/);
    });

    it('define 8 intentos como máximo', () => {
      expect(MAX_REQUEST_CODE_ATTEMPTS).toBe(8);
    });

    it.each([2, 5, 8])('ante P2002 recalcula el código y tiene éxito en el intento %d', async (successAt) => {
      const { accessRequest, pause, repository } = build();
      accessRequest.findFirst.mockImplementation(async () => ({ requestCode: `SOL-2026-${String(accessRequest.findFirst.mock.calls.length).padStart(4, '0')}` }));
      for (let attempt = 1; attempt < successAt; attempt++) {
        accessRequest.update.mockRejectedValueOnce(prismaError('P2002', { target: ['request_code'] }));
      }
      accessRequest.update.mockResolvedValueOnce({ id: 'id-1', requestCode: 'SOL-2026-0099' });

      await expect(repository.submitWithGeneratedCode('id-1')).resolves.toEqual({ id: 'id-1', requestCode: 'SOL-2026-0099' });

      expect(accessRequest.findFirst).toHaveBeenCalledTimes(successAt);
      expect(accessRequest.update).toHaveBeenCalledTimes(successAt);
      expect(pause).toHaveBeenCalledTimes(successAt - 1);
    });

    it('tras 8 intentos con P2002 lanza RequestCodeGenerationException (503) y pausa 7 veces', async () => {
      const { accessRequest, pause, repository } = build();
      accessRequest.findFirst.mockResolvedValue(null);
      accessRequest.update.mockRejectedValue(prismaError('P2002'));

      const error = await repository.submitWithGeneratedCode('id-1').catch((e) => e);

      expect(error).toBeInstanceOf(RequestCodeGenerationException);
      expect(error.statusCode).toBe(503);
      expect(error.message).toBe('No se pudo generar el código de la solicitud. Inténtalo de nuevo.');
      expect(accessRequest.update).toHaveBeenCalledTimes(8);
      expect(pause).toHaveBeenCalledTimes(7);
    });

    it('cada pausa dura entre 5 y 40 ms', async () => {
      const { accessRequest, pause, repository } = build();
      accessRequest.findFirst.mockResolvedValue(null);
      accessRequest.update.mockRejectedValue(prismaError('P2002'));

      await repository.submitWithGeneratedCode('id-1').catch(() => undefined);

      for (const [ms] of pause.mock.calls) {
        expect(ms).toBeGreaterThanOrEqual(5);
        expect(ms).toBeLessThanOrEqual(40);
      }
    });

    it.each([
      'uq_access_requests_email_submitted',
      'uq_access_requests_id_card_submitted',
      'uq_access_requests_sis_code_submitted',
    ])('un P2002 del índice %s lanza ActiveAccessRequestExistsException (409) sin reintentar', async (index) => {
      const { accessRequest, pause, repository } = build();
      accessRequest.findFirst.mockResolvedValue(null);
      accessRequest.update.mockRejectedValue(
        prismaError('P2002', { driverAdapterError: { cause: { constraint: { index } } } }),
      );

      const error = await repository.submitWithGeneratedCode('id-1').catch((e) => e);

      expect(error).toBeInstanceOf(ActiveAccessRequestExistsException);
      expect(error.statusCode).toBe(409);
      expect(error.message).toBe('Ya tienes una solicitud activa');
      expect(accessRequest.update).toHaveBeenCalledTimes(1);
      expect(pause).not.toHaveBeenCalled();
    });

    it('un P2002 de access_requests_request_code_key sí se reintenta', async () => {
      const { accessRequest, pause, repository } = build();
      accessRequest.findFirst.mockResolvedValue(null);
      accessRequest.update
        .mockRejectedValueOnce(
          prismaError('P2002', { driverAdapterError: { cause: { constraint: { index: 'access_requests_request_code_key' } } } }),
        )
        .mockResolvedValueOnce({ id: 'id-1', requestCode: 'SOL-2026-0001' });

      await expect(repository.submitWithGeneratedCode('id-1')).resolves.toEqual({ id: 'id-1', requestCode: 'SOL-2026-0001' });
      expect(pause).toHaveBeenCalledTimes(1);
    });

    it('un error distinto de P2002 no se reintenta ni pausa', async () => {
      const { accessRequest, pause, repository } = build();
      accessRequest.findFirst.mockResolvedValue(null);
      accessRequest.update.mockRejectedValue(prismaError('P2025'));

      await expect(repository.submitWithGeneratedCode('id-1')).rejects.toBeInstanceOf(AccessRequestNotFoundException);
      expect(accessRequest.update).toHaveBeenCalledTimes(1);
      expect(pause).not.toHaveBeenCalled();
    });
  });

  describe('findByRequestCode', () => {
    it('filtra por código y correo sin distinguir mayúsculas y no selecciona contenido ni datos personales', async () => {
      const { accessRequest, repository } = build();
      accessRequest.findFirst.mockResolvedValue(null);

      await repository.findByRequestCode('SOL-2026-0001', 'ana@umss.edu.bo');

      const args = accessRequest.findFirst.mock.calls[0][0];
      expect(args.where).toEqual({ requestCode: 'SOL-2026-0001', email: { equals: 'ana@umss.edu.bo', mode: 'insensitive' } });
      expect(args.select).toEqual({
        requestCode: true,
        submittedAt: true,
        reviewedAt: true,
        rejectionReason: true,
        status: { select: { title: true } },
        documentType: { select: { title: true } },
        documentFile: { select: { size: true, mimeType: true } },
      });
      for (const forbidden of ['content', 'idCardNumber', 'sisCode', 'phone', 'email', 'firstName', 'lastName', 'birthDate']) {
        expect(args.select).not.toHaveProperty(forbidden);
      }
      expect(args.select.documentFile.select).not.toHaveProperty('content');
    });
  });
});
