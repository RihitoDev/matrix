import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { DomainExceptionFilter } from '../../../common/filters/domain-exception.filter.js';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../../common/guards/roles.guard.js';
import { AccessRequestsController } from '../controllers/access-requests.controller.js';
import { AccessRequestsService } from '../services/access-requests.service.js';
import { MAX_FILE_SIZE_BYTES } from '../../files/constants/file-rules.constants.js';

const ID = '3f2b8a54-6d2e-4c7e-9a41-0b1d5f6c7e88';

describe('AccessRequestsController (documento de respaldo)', () => {
  const service = { attachDocument: vi.fn(), removeDocument: vi.fn() };
  let app: INestApplication;
  const controller = new AccessRequestsController(service as any);

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AccessRequestsController],
      providers: [{ provide: AccessRequestsService, useValue: service }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();
    app = moduleRef.createNestApplication();
    app.useGlobalFilters(new DomainExceptionFilter());
    await app.init();
  });

  afterAll(() => app.close());
  beforeEach(() => vi.resetAllMocks());

  it('delega la subida al servicio con el id, el archivo y el tipo', async () => {
    const file = { originalname: 'a.pdf', mimetype: 'application/pdf', size: 4, buffer: Buffer.from('%PDF') };
    service.attachDocument.mockResolvedValue({ id: ID });

    await expect(controller.attachDocument(ID, file, { documentType: 'national_title' })).resolves.toEqual({ id: ID });
    expect(service.attachDocument).toHaveBeenCalledWith(ID, { file, documentType: 'national_title' });
  });

  it('delega la eliminación al servicio con el id', async () => {
    service.removeDocument.mockResolvedValue({ id: ID, documentFileId: null });

    await expect(controller.removeDocument(ID)).resolves.toEqual({ id: ID, documentFileId: null });
    expect(service.removeDocument).toHaveBeenCalledWith(ID);
  });

  it('POST multipart entrega el archivo y el tipo al servicio', async () => {
    service.attachDocument.mockResolvedValue({ id: ID });

    await request(app.getHttpServer())
      .post(`/access-requests/${ID}/document`)
      .field('documentType', 'academic_diploma')
      .attach('file', Buffer.from('%PDF-1.4'), 'titulo.pdf')
      .expect(201);

    const [id, input] = service.attachDocument.mock.calls[0];
    expect(id).toBe(ID);
    expect(input.documentType).toBe('academic_diploma');
    expect(input.file.originalname).toBe('titulo.pdf');
    expect(input.file.buffer.toString()).toBe('%PDF-1.4');
  });

  it('POST sin archivo llega al servicio con file undefined', async () => {
    service.attachDocument.mockResolvedValue({ id: ID });

    await request(app.getHttpServer()).post(`/access-requests/${ID}/document`).field('documentType', 'national_title').expect(201);

    expect(service.attachDocument.mock.calls[0][1].file).toBeUndefined();
  });

  it('POST con tipo inválido responde 400 sin llamar al servicio', async () => {
    await request(app.getHttpServer())
      .post(`/access-requests/${ID}/document`)
      .field('documentType', 'otro')
      .attach('file', Buffer.from('%PDF'), 'a.pdf')
      .expect(400);

    expect(service.attachDocument).not.toHaveBeenCalled();
  });

  it('POST con un archivo mayor a 10 MB responde 413 en español', async () => {
    const res = await request(app.getHttpServer())
      .post(`/access-requests/${ID}/document`)
      .field('documentType', 'national_title')
      .attach('file', Buffer.alloc(MAX_FILE_SIZE_BYTES + 1, 0x25), 'grande.pdf');

    expect(res.status).toBe(413);
    expect(res.body.detail).toBe('El archivo no puede superar los 10 MB');
    expect(service.attachDocument).not.toHaveBeenCalled();
  });

  it.each([
    ['post', 'POST'],
    ['delete', 'DELETE'],
  ] as const)('%s con UUID inválido responde 400 con el mensaje existente', async (method) => {
    const res = await request(app.getHttpServer())[method]('/access-requests/no-es-uuid/document').field('documentType', 'national_title');

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('El identificador de la solicitud no es válido');
    expect(service.attachDocument).not.toHaveBeenCalled();
    expect(service.removeDocument).not.toHaveBeenCalled();
  });
});
