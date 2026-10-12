import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { DomainExceptionFilter } from '../../../common/filters/domain-exception.filter.js';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../../common/guards/roles.guard.js';
import { AccessRequestsController } from '../controllers/access-requests.controller.js';
import { AccessRequestNotFoundException } from '../exceptions/index.js';
import { AccessRequestsService } from '../services/access-requests.service.js';

const UNKNOWN_ID = '3f2b8a54-6d2e-4c7e-9a41-0b1d5f6c7e88';

describe('AccessRequestsController: identificador de la solicitud', () => {
  const service = {
    getDetail: vi.fn(),
    getDocument: vi.fn(),
    approve: vi.fn(),
    reject: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AccessRequestsController],
      providers: [{ provide: AccessRequestsService, useValue: service }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          context.switchToHttp().getRequest().user = { id: 'admin-id' };
          return true;
        },
      })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();
    app = moduleRef.createNestApplication();
    app.useGlobalFilters(new DomainExceptionFilter());
    await app.init();
  });

  afterAll(() => app.close());
  beforeEach(() => vi.resetAllMocks());

  it.each([
    ['get', '/access-requests/abc'],
    ['get', '/access-requests/abc/document'],
    ['patch', '/access-requests/abc/approve'],
    ['patch', '/access-requests/abc/reject'],
    ['patch', '/access-requests/abc'],
    ['delete', '/access-requests/abc'],
  ] as const)('%s %s con un id inválido responde 400 con el formato de errores de la API', async (method, url) => {
    const res = await request(app.getHttpServer())[method](url).send({ reason: 'Documento ilegible', firstName: 'Lionel' });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      statusCode: 400,
      ok: false,
      errors: [{ field: 'id', message: 'El identificador de la solicitud no es válido' }],
    });
    expect(res.body.message).toBeUndefined();
    for (const handler of Object.values(service)) expect(handler).not.toHaveBeenCalled();
  });

  it('un id válido que no existe responde 404', async () => {
    service.getDetail.mockRejectedValue(new AccessRequestNotFoundException());

    const res = await request(app.getHttpServer()).get(`/access-requests/${UNKNOWN_ID}`).expect(404);

    expect(res.body).toMatchObject({ statusCode: 404, ok: false, detail: 'La solicitud de acceso no existe' });
  });
});
