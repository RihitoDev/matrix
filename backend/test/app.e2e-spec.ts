import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { Server } from 'node:http';
import { vi } from 'vitest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from './../src/app.module.js';
import { PrismaService } from '../src/common/prisma/prisma.service.js';

const jwtMock = { verifyAsync: vi.fn() };

const prismaMock = {
  $connect: vi.fn(),
  $disconnect: vi.fn(),
  event: { findMany: vi.fn().mockResolvedValue([]) },
  user: { findUnique: vi.fn() },
  eventRegistration: { findMany: vi.fn().mockResolvedValue([]) },
};

describe('AppController (e2e)', () => {
  let app: INestApplication<Server>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(JwtService)
      .useValue(jwtMock)
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer()).get('/').expect(200).expect({
      statusCode: 200,
      ok: true,
      detail: 'Operación exitosa',
      data: 'Hello World!',
    });
  });

  it('keeps global DTO validation enabled for login', async () => {
    await request(app.getHttpServer()).post('/auth/login').send({}).expect(400);
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });

  it('requires authentication for Mis pases', async () => {
    await request(app.getHttpServer())
      .get('/event-registrations/me')
      .expect(401);
    expect(prismaMock.eventRegistration.findMany).not.toHaveBeenCalled();
  });

  it('returns only the authenticated user passes with the response envelope', async () => {
    const verify = jwtMock.verifyAsync;
    for (const sub of ['user-with-passes', 'user-without-passes']) {
      verify.mockResolvedValueOnce({ sub });
      const response = await request(app.getHttpServer())
        .get('/event-registrations/me?userId=another-user')
        .set('Authorization', `Bearer ${sub}-token`)
        .expect(200);
      expect(response.body).toMatchObject({ ok: true, data: [] });
      expect(prismaMock.eventRegistration.findMany).toHaveBeenLastCalledWith(
        expect.objectContaining({
          where: {
            userId: sub,
            cancelledAt: null,
            status: { title: 'Confirmada' },
          },
        }),
      );
    }
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    await app.close();
  });
});
