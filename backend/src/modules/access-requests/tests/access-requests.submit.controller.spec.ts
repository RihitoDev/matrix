import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { DomainExceptionFilter } from '../../../common/filters/domain-exception.filter.js';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../../common/guards/roles.guard.js';
import { AccessRequestsController } from '../controllers/access-requests.controller.js';
import { AccessRequestNotFoundException } from '../exceptions/index.js';
import { AccessRequestsService } from '../services/access-requests.service.js';

const ID = '3f2b8a54-6d2e-4c7e-9a41-0b1d5f6c7e88';

describe('AccessRequestsController: envío y consulta de estado', () => {
  const service = { submit: vi.fn(), getStatus: vi.fn() };
  let app: INestApplication;

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

  it('POST /:id/submit delega en el servicio con el id', async () => {
    service.submit.mockResolvedValue({ id: ID, requestCode: 'SOL-2026-0001', status: 'pending', submittedAt: '2026-10-05T15:00:00.000Z' });

    const res = await request(app.getHttpServer()).post(`/access-requests/${ID}/submit`).expect(201);

    expect(service.submit).toHaveBeenCalledWith(ID);
    expect(res.body).toEqual({ id: ID, requestCode: 'SOL-2026-0001', status: 'pending', submittedAt: '2026-10-05T15:00:00.000Z' });
  });

  it('POST /:id/submit con un UUID inválido responde 400 con el mensaje existente', async () => {
    const res = await request(app.getHttpServer()).post('/access-requests/no-es-uuid/submit').expect(400);

    expect(res.body.message).toBe('El identificador de la solicitud no es válido');
    expect(service.submit).not.toHaveBeenCalled();
  });

  it('GET /status/:code?email= delega en el servicio con el código y el correo en minúsculas', async () => {
    service.getStatus.mockResolvedValue({ requestCode: 'SOL-2026-0001', status: 'pending' });

    const res = await request(app.getHttpServer()).get('/access-requests/status/SOL-2026-0001').query({ email: 'Ana@Umss.edu.bo' }).expect(200);

    expect(service.getStatus).toHaveBeenCalledWith('SOL-2026-0001', 'ana@umss.edu.bo');
    expect(res.body).toEqual({ requestCode: 'SOL-2026-0001', status: 'pending' });
  });

  it('la ruta status/:code se resuelve antes que cualquier ruta con :id (no se toma "status" como id)', async () => {
    service.getStatus.mockResolvedValue({ requestCode: 'SOL-2026-0001' });

    await request(app.getHttpServer()).get('/access-requests/status/SOL-2026-0001').query({ email: 'ana@umss.edu.bo' }).expect(200);

    expect(service.getStatus).toHaveBeenCalledTimes(1);
    expect(service.submit).not.toHaveBeenCalled();
  });

  it.each([
    ['código inválido', '/access-requests/status/abc', { email: 'ana@umss.edu.bo' }],
    ['sin correo', '/access-requests/status/SOL-2026-0001', {}],
    ['correo inválido', '/access-requests/status/SOL-2026-0001', { email: 'no-es-correo' }],
  ])('GET con %s responde 400 sin llamar al servicio', async (_name, url, query) => {
    await request(app.getHttpServer()).get(url).query(query).expect(400);

    expect(service.getStatus).not.toHaveBeenCalled();
  });

  it('GET responde 404 en español cuando el servicio no encuentra la solicitud', async () => {
    service.getStatus.mockRejectedValue(new AccessRequestNotFoundException());

    const res = await request(app.getHttpServer()).get('/access-requests/status/SOL-2026-0001').query({ email: 'otra@umss.edu.bo' }).expect(404);

    expect(res.body.detail).toBe('La solicitud de acceso no existe');
  });
});
