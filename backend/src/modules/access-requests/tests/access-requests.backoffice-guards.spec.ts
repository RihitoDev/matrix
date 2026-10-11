import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
import { DomainExceptionFilter } from '../../../common/filters/domain-exception.filter.js';
import { AccessRequestsController } from '../controllers/access-requests.controller.js';
import { AccessRequestsService } from '../services/access-requests.service.js';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../../common/guards/roles.guard.js';

const ID = '3f2b8a54-6d2e-4c7e-9a41-0b1d5f6c7e88';

// Guards REALES (JwtAuthGuard y RolesGuard) con JwtService y Prisma simulados
describe('AccessRequestsController: guards compartidos del backoffice', () => {
  const service = { list: vi.fn(), getDetail: vi.fn(), approve: vi.fn(), getStatus: vi.fn(), create: vi.fn() };
  const jwtService = { verifyAsync: vi.fn() };
  const prisma = { user: { findFirst: vi.fn() } };
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AccessRequestsController],
      providers: [
        { provide: AccessRequestsService, useValue: service },
        { provide: JwtService, useValue: jwtService },
        { provide: PrismaService, useValue: prisma },
        JwtAuthGuard,
        RolesGuard,
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalFilters(new DomainExceptionFilter());
    await app.init();
  });

  afterAll(() => app.close());

  beforeEach(() => {
    vi.resetAllMocks();
    jwtService.verifyAsync.mockImplementation(async (token: string) => {
      if (token === 'token-admin') return { sub: 'admin-1', roleTag: 'administrativo' };
      if (token === 'token-titulado') return { sub: 'tit-1', roleTag: 'titulado' };
      throw new Error('jwt malformed');
    });
    prisma.user.findFirst.mockImplementation(async ({ where }) => ({
      id: where.id,
      email: `${where.id}@umss.test`,
      roles: [{ role: { name: where.id === 'admin-1' ? 'administrativo' : 'titulado' } }],
    }));
    service.list.mockResolvedValue({ data: { items: [], total: 0 }, page: 1, offset: 0 });
    service.getDetail.mockResolvedValue({ id: ID });
    service.getStatus.mockResolvedValue({ requestCode: 'SOL-2026-0001' });
    service.create.mockResolvedValue({ id: ID });
  });

  it('sin token una ruta del backoffice responde 401', async () => {
    const response = await request(app.getHttpServer()).get('/access-requests');
    expect(response.status).toBe(401);
    expect(service.list).not.toHaveBeenCalled();
  });

  it('un token inválido responde 401', async () => {
    const response = await request(app.getHttpServer()).get('/access-requests').set('Authorization', 'Bearer texto-aleatorio');
    expect(response.status).toBe(401);
  });

  it('un token de titulado responde 403', async () => {
    const response = await request(app.getHttpServer()).get('/access-requests').set('Authorization', 'Bearer token-titulado');
    expect(response.status).toBe(403);
    expect(service.list).not.toHaveBeenCalled();
  });

  it('un token de administrativo responde 200', async () => {
    const response = await request(app.getHttpServer()).get('/access-requests').set('Authorization', 'Bearer token-admin');
    expect(response.status).toBe(200);
    expect(service.list).toHaveBeenCalledOnce();
  });

  it('el detalle recibe al administrador de la sesión como persona revisora', async () => {
    const response = await request(app.getHttpServer()).get(`/access-requests/${ID}`).set('Authorization', 'Bearer token-admin');
    expect(response.status).toBe(200);
    expect(service.getDetail).toHaveBeenCalledWith(ID, 'admin-1');
  });

  it('las rutas públicas responden sin token', async () => {
    const status = await request(app.getHttpServer()).get('/access-requests/status/SOL-2026-0001?email=a@b.co');
    expect(status.status).toBe(200);
    const created = await request(app.getHttpServer()).post('/access-requests').send({});
    expect(created.status).not.toBe(401);
    expect(created.status).not.toBe(403);
  });
});
