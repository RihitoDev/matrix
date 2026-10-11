import { describe, expect, it, vi } from 'vitest';
import { Prisma } from '../../../prisma/client.js';
import { AccessRequestsController } from '../controllers/access-requests.controller.js';
import { AccessRequestNotFoundException, RequestDocumentNotFoundException } from '../exceptions/index.js';
import { toAccessRequestDetail } from '../mappers/access-request-detail.mapper.js';
import { AccessRequestsRepository } from '../repositories/access-requests.repository.js';
import { AccessRequestsService } from '../services/access-requests.service.js';

const detailRow = (status: string, extra: Record<string, unknown> = {}) => ({
  id: 'id-1',
  requestCode: 'SOL-2026-0001',
  firstName: 'Ana',
  lastName: 'Pérez',
  idCardNumber: '1234567',
  idCardIssuedIn: 'CB',
  sisCode: '2018001',
  email: 'ana@umss.test',
  phone: '71234567',
  birthDate: new Date('2000-05-10T00:00:00.000Z'),
  graduationYear: 2022,
  documentFileId: 'file-1',
  submittedAt: new Date('2026-10-05T12:00:00.000Z'),
  reviewedAt: null,
  rejectionReason: null,
  status: { title: status },
  career: { title: 'Licenciatura en Ingeniería de Sistemas' },
  documentType: { title: 'academic_diploma' },
  documentFile: { name: 'diploma', extension: 'pdf', mimeType: 'application/pdf', size: 1024 },
  reviewedBy: null,
  ...extra,
});

describe('toAccessRequestDetail', () => {
  it('devuelve los datos declarados, el documento y el historial sin contenido de archivo', () => {
    const detail = toAccessRequestDetail(detailRow('pending') as never);

    expect(detail).toMatchObject({
      id: 'id-1',
      status: 'pending',
      firstName: 'Ana',
      idCardNumber: '1234567',
      birthDate: '2000-05-10',
      career: 'Licenciatura en Ingeniería de Sistemas',
      document: { type: 'academic_diploma', name: 'diploma', extension: 'pdf', mimeType: 'application/pdf', size: 1024 },
      history: { submittedAt: '2026-10-05T12:00:00.000Z', reviewedAt: null, reviewedBy: null, rejectionReason: null },
    });
    expect(JSON.stringify(detail)).not.toContain('content');
  });

  it('incluye quién y cuándo la revisó, y tolera un documento ausente', () => {
    const detail = toAccessRequestDetail(
      detailRow('in_review', {
        documentFile: null,
        reviewedAt: new Date('2026-10-05T13:00:00.000Z'),
        reviewedBy: { firstName: 'Bo', lastName: 'Admin' },
      }) as never,
    );

    expect(detail.document).toBeNull();
    expect(detail.history).toMatchObject({ reviewedAt: '2026-10-05T13:00:00.000Z', reviewedBy: 'Bo Admin' });
  });
});

describe('AccessRequestsRepository: detalle y revisión', () => {
  const prismaError = (code: string) => new Prisma.PrismaClientKnownRequestError('boom', { code, clientVersion: 'test' });
  const build = () => {
    const accessRequest = { findUnique: vi.fn(), update: vi.fn() };
    return { accessRequest, repository: new AccessRequestsRepository({ accessRequest } as any) };
  };

  it('findDetailById selecciona metadatos del archivo y nunca su contenido', async () => {
    const { accessRequest, repository } = build();
    accessRequest.findUnique.mockResolvedValue(null);

    await repository.findDetailById('id-1');

    const { where, select } = accessRequest.findUnique.mock.calls[0][0];
    expect(where).toEqual({ id: 'id-1' });
    expect(select.documentFile.select).toEqual({ name: true, extension: true, mimeType: true, size: true });
    expect(JSON.stringify(select)).not.toContain('"content"');
  });

  it('markInReview actualiza de forma condicional por estado pending y registra quién y cuándo', async () => {
    const { accessRequest, repository } = build();
    accessRequest.update.mockResolvedValue({ id: 'id-1' });

    await expect(repository.markInReview('id-1', 'admin-1')).resolves.toBe(true);

    const args = accessRequest.update.mock.calls[0][0];
    expect(args.where).toEqual({ id: 'id-1', status: { title: 'pending' } });
    expect(args.data.status).toEqual({ connect: { title: 'in_review' } });
    expect(args.data.reviewedBy).toEqual({ connect: { id: 'admin-1' } });
    expect(args.data.reviewedAt).toBeInstanceOf(Date);
  });

  it('markInReview devuelve false si ya no estaba pendiente (P2025) y relanza otros errores', async () => {
    const { accessRequest, repository } = build();
    accessRequest.update.mockRejectedValueOnce(prismaError('P2025'));
    await expect(repository.markInReview('id-1', 'admin-1')).resolves.toBe(false);

    const boom = prismaError('P2002');
    accessRequest.update.mockRejectedValueOnce(boom);
    await expect(repository.markInReview('id-1', 'admin-1')).rejects.toBe(boom);
  });
});

describe('AccessRequestsService: detalle y documento', () => {
  const build = () => {
    const repository = { findDetailById: vi.fn(), markInReview: vi.fn().mockResolvedValue(true) };
    const files = { getContent: vi.fn() };
    return { repository, files, service: new AccessRequestsService(repository as any, {} as any, files as any) };
  };

  it('una solicitud pendiente pasa a en revisión al abrirla y se devuelve ya actualizada', async () => {
    const { repository, service } = build();
    repository.findDetailById
      .mockResolvedValueOnce(detailRow('pending'))
      .mockResolvedValueOnce(detailRow('in_review', { reviewedBy: { firstName: 'Bo', lastName: 'Admin' } }));

    const detail = await service.getDetail('id-1', 'admin-1');

    expect(repository.markInReview).toHaveBeenCalledWith('id-1', 'admin-1');
    expect(detail.status).toBe('in_review');
    expect(detail.history.reviewedBy).toBe('Bo Admin');
  });

  it.each(['in_review', 'approved', 'rejected'])('una solicitud %s se devuelve sin cambiar su estado', async (status) => {
    const { repository, service } = build();
    repository.findDetailById.mockResolvedValue(detailRow(status));

    await expect(service.getDetail('id-1', 'admin-1')).resolves.toMatchObject({ status });
    expect(repository.markInReview).not.toHaveBeenCalled();
  });

  it('responde 404 si no existe, si es un borrador o si desaparece al abrirla', async () => {
    const { repository, service } = build();
    repository.findDetailById.mockResolvedValueOnce(null);
    await expect(service.getDetail('x', 'a')).rejects.toBeInstanceOf(AccessRequestNotFoundException);

    repository.findDetailById.mockResolvedValueOnce(detailRow('draft'));
    await expect(service.getDetail('x', 'a')).rejects.toBeInstanceOf(AccessRequestNotFoundException);

    repository.findDetailById.mockResolvedValueOnce(detailRow('pending')).mockResolvedValueOnce(null);
    await expect(service.getDetail('x', 'a')).rejects.toBeInstanceOf(AccessRequestNotFoundException);
  });

  it('getDocument devuelve el archivo desde FilesService', async () => {
    const { repository, files, service } = build();
    repository.findDetailById.mockResolvedValue(detailRow('pending'));
    files.getContent.mockResolvedValue({ name: 'diploma', extension: 'pdf', mimeType: 'application/pdf', content: Buffer.from('%PDF') });

    await expect(service.getDocument('id-1')).resolves.toMatchObject({ mimeType: 'application/pdf' });
    expect(files.getContent).toHaveBeenCalledWith('file-1');
  });

  it('getDocument responde 404 si no existe, es borrador o no tiene documento', async () => {
    const { repository, service } = build();
    repository.findDetailById.mockResolvedValueOnce(null);
    await expect(service.getDocument('x')).rejects.toBeInstanceOf(AccessRequestNotFoundException);

    repository.findDetailById.mockResolvedValueOnce(detailRow('draft'));
    await expect(service.getDocument('x')).rejects.toBeInstanceOf(AccessRequestNotFoundException);

    repository.findDetailById.mockResolvedValueOnce(detailRow('pending', { documentFileId: null }));
    const error = await service.getDocument('x').catch((e) => e);
    expect(error).toBeInstanceOf(RequestDocumentNotFoundException);
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('La solicitud no tiene un documento adjunto');
  });
});

describe('AccessRequestsController: detalle y documento', () => {
  it('getDetail delega con el id de la persona de la sesión', async () => {
    const service = { getDetail: vi.fn().mockResolvedValue({ id: 'id-1' }) };
    const controller = new AccessRequestsController(service as any);

    await expect(controller.getDetail('id-1', { id: 'admin-1', email: 'a@b.co', roles: ['administrativo'] })).resolves.toEqual({ id: 'id-1' });
    expect(service.getDetail).toHaveBeenCalledWith('id-1', 'admin-1');
  });

  it('getDocument responde el binario con Content-Type y Content-Disposition inline', async () => {
    const content = Buffer.from('%PDF-1.4');
    const service = { getDocument: vi.fn().mockResolvedValue({ name: 'título académico', extension: 'pdf', mimeType: 'application/pdf', content }) };
    const controller = new AccessRequestsController(service as any);
    const response = { set: vi.fn(), end: vi.fn() };

    await controller.getDocument('id-1', response);

    expect(response.set).toHaveBeenCalledWith({
      'Content-Type': 'application/pdf',
      'Content-Length': String(content.length),
      'Content-Disposition': "inline; filename*=UTF-8''t%C3%ADtulo%20acad%C3%A9mico.pdf",
    });
    expect(response.end).toHaveBeenCalledWith(content);
  });
});
