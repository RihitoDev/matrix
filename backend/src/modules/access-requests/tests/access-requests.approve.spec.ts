import * as bcrypt from 'bcrypt';
import { Logger } from '@nestjs/common';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Prisma } from '../../../prisma/client.js';
import { OTP_DIGITS, OTP_MAX_ATTEMPTS, OTP_TTL_HOURS } from '../constants/otp.constants.js';
import { AccessRequestsController } from '../controllers/access-requests.controller.js';
import { AccessRequestNotFoundException, RequestNotInReviewException } from '../exceptions/index.js';
import { ConsoleMailSender } from '../mail/console-mail-sender.js';
import { AccessRequestsRepository } from '../repositories/access-requests.repository.js';
import { ActivationOtpRepository } from '../repositories/activation-otp.repository.js';
import { AccessRequestsService } from '../services/access-requests.service.js';
import { ActivationOtpService, generateOtpCode } from '../services/activation-otp.service.js';

describe('generateOtpCode', () => {
  it('genera siempre 6 dígitos numéricos, con ceros a la izquierda', () => {
    for (let i = 0; i < 200; i++) {
      expect(generateOtpCode()).toMatch(new RegExp(`^\\d{${OTP_DIGITS}}$`));
    }
    expect(OTP_DIGITS).toBe(6);
    expect(OTP_TTL_HOURS).toBe(24);
    expect(OTP_MAX_ATTEMPTS).toBe(5);
  });
});

describe('ActivationOtpService', () => {
  const NOW = new Date('2026-10-05T12:00:00.000Z');
  const build = () => {
    const repository = { create: vi.fn().mockResolvedValue({ id: 'otp-1' }) };
    const mail = { sendActivationCode: vi.fn().mockResolvedValue(undefined), sendRejection: vi.fn() };
    return { repository, mail, service: new ActivationOtpService(repository as any, mail as any) };
  };

  afterEach(() => vi.restoreAllMocks());

  it('guarda solo el hash bcrypt con 24 horas de vigencia y envía el código en texto al correo', async () => {
    const { repository, mail, service } = build();

    await expect(service.issueFor('req-1', 'ana@umss.test', NOW)).resolves.toBe(true);

    const stored = repository.create.mock.calls[0][0];
    const [to, code, expiresAt] = mail.sendActivationCode.mock.calls[0];
    expect(to).toBe('ana@umss.test');
    expect(code).toMatch(/^\d{6}$/);
    expect(stored.accessRequestId).toBe('req-1');
    expect(stored.codeHash).not.toBe(code);
    expect(JSON.stringify(stored)).not.toContain(code);
    expect(await bcrypt.compare(code, stored.codeHash)).toBe(true);
    expect(stored.expiresAt).toEqual(new Date('2026-10-06T12:00:00.000Z'));
    expect(expiresAt).toEqual(stored.expiresAt);
  });

  it('usa la fecha actual por defecto', async () => {
    const { repository, service } = build();
    await service.issueFor('req-1', 'ana@umss.test');
    expect(repository.create.mock.calls[0][0].expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it('si el envío falla registra el error y devuelve false sin lanzar', async () => {
    const { mail, service } = build();
    const logError = vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    mail.sendActivationCode.mockRejectedValue(new Error('smtp caído'));

    await expect(service.issueFor('req-1', 'ana@umss.test', NOW)).resolves.toBe(false);
    expect(logError).toHaveBeenCalledOnce();
    expect(String(logError.mock.calls[0][0])).not.toMatch(/\d{6}/);
  });

  it('si no se puede guardar el hash devuelve false y no envía nada', async () => {
    const { repository, mail, service } = build();
    vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    repository.create.mockRejectedValue('fallo de base');

    await expect(service.issueFor('req-1', 'ana@umss.test', NOW)).resolves.toBe(false);
    expect(mail.sendActivationCode).not.toHaveBeenCalled();
  });
});

describe('ActivationOtpRepository', () => {
  it('crea el registro con el hash y la expiración', async () => {
    const activationOtp = { create: vi.fn().mockResolvedValue({ id: 'otp-1' }) };
    const repository = new ActivationOtpRepository({ activationOtp } as any);
    const data = { accessRequestId: 'req-1', codeHash: '$2b$hash', expiresAt: new Date() };

    await repository.create(data);

    expect(activationOtp.create).toHaveBeenCalledWith({ data, select: { id: true, expiresAt: true } });
  });
});

describe('ConsoleMailSender', () => {
  const originalEnv = process.env.NODE_ENV;
  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    vi.restoreAllMocks();
  });

  it('fuera de producción registra el destinatario y el código', async () => {
    const log = vi.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    process.env.NODE_ENV = 'development';

    await new ConsoleMailSender().sendActivationCode('ana@umss.test', '123456', new Date('2026-10-06T00:00:00Z'));

    expect(String(log.mock.calls[0][0])).toContain('ana@umss.test');
    expect(String(log.mock.calls[0][0])).toContain('123456');
  });

  it('en producción no registra el código', async () => {
    const log = vi.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    process.env.NODE_ENV = 'production';

    await new ConsoleMailSender().sendActivationCode('ana@umss.test', '123456', new Date());

    expect(String(log.mock.calls[0][0])).toContain('ana@umss.test');
    expect(String(log.mock.calls[0][0])).not.toContain('123456');
  });

  it('el correo de rechazo registra el destinatario y el motivo', async () => {
    const log = vi.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    await new ConsoleMailSender().sendRejection('ana@umss.test', 'Documento ilegible');
    expect(String(log.mock.calls[0][0])).toContain('Documento ilegible');
  });
});

describe('AccessRequestsRepository.setVerdict', () => {
  const prismaError = (code: string) => new Prisma.PrismaClientKnownRequestError('boom', { code, clientVersion: 'test' });
  const build = () => {
    const accessRequest = { update: vi.fn() };
    return { accessRequest, repository: new AccessRequestsRepository({ accessRequest } as any) };
  };

  it('actualiza de forma condicional por estado in_review y registra quién y cuándo', async () => {
    const { accessRequest, repository } = build();
    accessRequest.update.mockResolvedValue({ id: 'id-1' });

    await expect(repository.setVerdict('id-1', 'admin-1', { status: 'approved' })).resolves.toBe(true);

    const args = accessRequest.update.mock.calls[0][0];
    expect(args.where).toEqual({ id: 'id-1', status: { title: 'in_review' } });
    expect(args.data.status).toEqual({ connect: { title: 'approved' } });
    expect(args.data.reviewedBy).toEqual({ connect: { id: 'admin-1' } });
    expect(args.data.reviewedAt).toBeInstanceOf(Date);
    expect(args.data.rejectionReason).toBeUndefined();
  });

  it('guarda el motivo del rechazo cuando se indica', async () => {
    const { accessRequest, repository } = build();
    accessRequest.update.mockResolvedValue({ id: 'id-1' });

    await repository.setVerdict('id-1', 'admin-1', { status: 'rejected', rejectionReason: 'Documento ilegible' });

    expect(accessRequest.update.mock.calls[0][0].data.rejectionReason).toBe('Documento ilegible');
  });

  it('devuelve false ante P2025 y relanza otros errores', async () => {
    const { accessRequest, repository } = build();
    accessRequest.update.mockRejectedValueOnce(prismaError('P2025'));
    await expect(repository.setVerdict('id-1', 'a', { status: 'approved' })).resolves.toBe(false);

    const boom = prismaError('P2002');
    accessRequest.update.mockRejectedValueOnce(boom);
    await expect(repository.setVerdict('id-1', 'a', { status: 'approved' })).rejects.toBe(boom);
  });
});

describe('AccessRequestsService.approve', () => {
  const row = (status: string) => ({ id: 'id-1', email: 'ana@umss.test', status: { title: status } });
  const build = () => {
    const repository = { findDetailById: vi.fn(), setVerdict: vi.fn().mockResolvedValue(true) };
    const otp = { issueFor: vi.fn().mockResolvedValue(true) };
    return { repository, otp, service: new AccessRequestsService(repository as any, {} as any, {} as any, otp as any) };
  };

  it('una solicitud en revisión pasa a aprobada y emite el código de activación', async () => {
    const { repository, otp, service } = build();
    repository.findDetailById.mockResolvedValue(row('in_review'));

    await expect(service.approve('id-1', 'admin-1')).resolves.toEqual({ id: 'id-1', status: 'approved', activationCodeSent: true });
    expect(repository.setVerdict).toHaveBeenCalledWith('id-1', 'admin-1', { status: 'approved' });
    expect(otp.issueFor).toHaveBeenCalledWith('id-1', 'ana@umss.test');
  });

  it('si el código no se pudo enviar la aprobación se mantiene y se avisa', async () => {
    const { repository, otp, service } = build();
    repository.findDetailById.mockResolvedValue(row('in_review'));
    otp.issueFor.mockResolvedValue(false);

    await expect(service.approve('id-1', 'admin-1')).resolves.toMatchObject({ status: 'approved', activationCodeSent: false });
  });

  it.each(['pending', 'approved', 'rejected'])('responde 409 si la solicitud está %s', async (status) => {
    const { repository, otp, service } = build();
    repository.findDetailById.mockResolvedValue(row(status));

    const error = await service.approve('id-1', 'admin-1').catch((e) => e);

    expect(error).toBeInstanceOf(RequestNotInReviewException);
    expect(error.statusCode).toBe(409);
    expect(error.message).toBe('La solicitud no está en revisión');
    expect(repository.setVerdict).not.toHaveBeenCalled();
    expect(otp.issueFor).not.toHaveBeenCalled();
  });

  it('responde 404 si no existe o es un borrador', async () => {
    const { repository, service } = build();
    repository.findDetailById.mockResolvedValueOnce(null);
    await expect(service.approve('x', 'a')).rejects.toBeInstanceOf(AccessRequestNotFoundException);
    repository.findDetailById.mockResolvedValueOnce(row('draft'));
    await expect(service.approve('x', 'a')).rejects.toBeInstanceOf(AccessRequestNotFoundException);
  });

  it('responde 409 y no emite código si otra persona dictaminó entre la lectura y la actualización', async () => {
    const { repository, otp, service } = build();
    repository.findDetailById.mockResolvedValue(row('in_review'));
    repository.setVerdict.mockResolvedValue(false);

    await expect(service.approve('id-1', 'admin-1')).rejects.toBeInstanceOf(RequestNotInReviewException);
    expect(otp.issueFor).not.toHaveBeenCalled();
  });

  it('el controller delega con el id de la persona de la sesión', async () => {
    const service = { approve: vi.fn().mockResolvedValue({ id: 'id-1' }) };
    const controller = new AccessRequestsController(service as any);

    await controller.approve('id-1', { id: 'admin-1', email: 'a@b.co', roles: ['administrativo'] });

    expect(service.approve).toHaveBeenCalledWith('id-1', 'admin-1');
  });
});
