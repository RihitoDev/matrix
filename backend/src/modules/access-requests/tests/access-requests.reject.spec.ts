import { Logger } from '@nestjs/common';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AccessRequestsController } from '../controllers/access-requests.controller.js';
import { AccessRequestNotFoundException, RequestNotInReviewException } from '../exceptions/index.js';
import { rejectAccessRequestSchema } from '../requests/reject-access-request.schema.js';
import { MAX_REJECTION_REASON_LENGTH } from '../constants/reject-access-request.constants.js';
import { AccessRequestsService } from '../services/access-requests.service.js';
import { RejectionNotificationService } from '../services/rejection-notification.service.js';

const messagesOf = (input: unknown) => {
  const result = rejectAccessRequestSchema.safeParse(input);
  return result.success ? [] : result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
};

describe('rejectAccessRequestSchema', () => {
  it('acepta un motivo y lo recorta', () => {
    expect(rejectAccessRequestSchema.parse({ reason: '  Documento ilegible  ' })).toEqual({ reason: 'Documento ilegible' });
  });

  it.each([{}, { reason: '' }, { reason: '    ' }, { reason: null }])('sin motivo (%j) responde en español', (input) => {
    expect(messagesOf(input)).toContain('reason: El motivo del rechazo es obligatorio');
  });

  it('acepta 500 caracteres y rechaza 501', () => {
    expect(messagesOf({ reason: 'a'.repeat(MAX_REJECTION_REASON_LENGTH) })).toEqual([]);
    expect(messagesOf({ reason: 'a'.repeat(MAX_REJECTION_REASON_LENGTH + 1) })).toContain('reason: El motivo no puede superar los 500 caracteres');
  });
});

describe('RejectionNotificationService', () => {
  afterEach(() => vi.restoreAllMocks());

  it('envía el motivo al correo del titulado', async () => {
    const mail = { sendRejection: vi.fn().mockResolvedValue(undefined) };
    const service = new RejectionNotificationService(mail as any);

    await expect(service.notify('ana@umss.test', 'Documento ilegible', 'req-1')).resolves.toBe(true);
    expect(mail.sendRejection).toHaveBeenCalledWith('ana@umss.test', 'Documento ilegible');
  });

  it.each([new Error('smtp caído'), 'texto'])('si el envío falla registra el error y devuelve false (%s)', async (failure) => {
    const logError = vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    const mail = { sendRejection: vi.fn().mockRejectedValue(failure) };
    const service = new RejectionNotificationService(mail as any);

    await expect(service.notify('ana@umss.test', 'Motivo', 'req-1')).resolves.toBe(false);
    expect(logError).toHaveBeenCalledOnce();
  });
});

describe('AccessRequestsService.reject', () => {
  const row = (status: string) => ({ id: 'id-1', email: 'ana@umss.test', status: { title: status } });
  const build = () => {
    const repository = { findDetailById: vi.fn(), setVerdict: vi.fn().mockResolvedValue(true) };
    const notification = { notify: vi.fn().mockResolvedValue(true) };
    return { repository, notification, service: new AccessRequestsService(repository as any, {} as any, {} as any, {} as any, notification as any) };
  };

  it('una solicitud en revisión pasa a rechazada con su motivo y se notifica por correo', async () => {
    const { repository, notification, service } = build();
    repository.findDetailById.mockResolvedValue(row('in_review'));

    await expect(service.reject('id-1', 'admin-1', 'Documento ilegible')).resolves.toEqual({
      id: 'id-1',
      status: 'rejected',
      rejectionReason: 'Documento ilegible',
      notificationSent: true,
    });
    expect(repository.setVerdict).toHaveBeenCalledWith('id-1', 'admin-1', { status: 'rejected', rejectionReason: 'Documento ilegible' });
    expect(notification.notify).toHaveBeenCalledWith('ana@umss.test', 'Documento ilegible', 'id-1');
  });

  it('si el correo falla el rechazo se mantiene y se avisa', async () => {
    const { repository, notification, service } = build();
    repository.findDetailById.mockResolvedValue(row('in_review'));
    notification.notify.mockResolvedValue(false);

    await expect(service.reject('id-1', 'admin-1', 'Motivo')).resolves.toMatchObject({ status: 'rejected', notificationSent: false });
  });

  it.each(['pending', 'approved', 'rejected'])('responde 409 si la solicitud está %s', async (status) => {
    const { repository, notification, service } = build();
    repository.findDetailById.mockResolvedValue(row(status));

    await expect(service.reject('id-1', 'admin-1', 'Motivo')).rejects.toBeInstanceOf(RequestNotInReviewException);
    expect(repository.setVerdict).not.toHaveBeenCalled();
    expect(notification.notify).not.toHaveBeenCalled();
  });

  it('responde 404 si no existe o es un borrador', async () => {
    const { repository, service } = build();
    repository.findDetailById.mockResolvedValueOnce(null);
    await expect(service.reject('x', 'a', 'm')).rejects.toBeInstanceOf(AccessRequestNotFoundException);
    repository.findDetailById.mockResolvedValueOnce(row('draft'));
    await expect(service.reject('x', 'a', 'm')).rejects.toBeInstanceOf(AccessRequestNotFoundException);
  });

  it('responde 409 y no notifica si otra persona dictaminó antes', async () => {
    const { repository, notification, service } = build();
    repository.findDetailById.mockResolvedValue(row('in_review'));
    repository.setVerdict.mockResolvedValue(false);

    await expect(service.reject('id-1', 'admin-1', 'Motivo')).rejects.toBeInstanceOf(RequestNotInReviewException);
    expect(notification.notify).not.toHaveBeenCalled();
  });

  it('el controller delega con el id, el motivo y la persona de la sesión', async () => {
    const service = { reject: vi.fn().mockResolvedValue({ id: 'id-1' }) };
    const controller = new AccessRequestsController(service as any);

    await controller.reject('id-1', { reason: 'Motivo' }, { id: 'admin-1', email: 'a@b.co', roles: ['administrativo'] });

    expect(service.reject).toHaveBeenCalledWith('id-1', 'admin-1', 'Motivo');
  });
});
