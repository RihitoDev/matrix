import type { INestApplication } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { DomainExceptionFilter } from '../../../common/filters/domain-exception.filter.js';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
import { EducationsModule } from '../educations.module.js';
import { EducationsRepository } from '../repositories/educations.repository.js';
import { educationIdSchema } from '../requests/education-fields.schema.js';

// Opt in only against a provisioned, disposable *_test database, not DB_SCHEMA=test.
// Set EDUCATIONS_E2E_DATABASE to its DB_NAME and EDUCATIONS_E2E_USER_ID to an existing fixture user.
const DATABASE = process.env.EDUCATIONS_E2E_DATABASE;
const REQUEST_TIMEOUT = 10_000;
const TEST_TIMEOUT = 30_000;
const apps: INestApplication[] = [];
const clients: PrismaService[] = [];
const createdIds: string[] = [];
const jwt = new JwtService({ secret: 'education-concurrency-test-secret' });
let userId: string;
let token: string;

describe.skipIf(!DATABASE)('Education persistence and concurrent HTTP updates', () => {
  beforeAll(async () => {
    if (!DATABASE?.endsWith('_test') || process.env.DB_NAME !== DATABASE) {
      throw new Error('Use an explicitly confirmed, disposable DB_NAME ending in _test');
    }
    userId = educationIdSchema.parse(process.env.EDUCATIONS_E2E_USER_ID);
    for (let index = 0; index < 2; index += 1) {
      const moduleRef = await Test.createTestingModule({
        imports: [EducationsModule],
        providers: [{ provide: APP_FILTER, useClass: DomainExceptionFilter }],
      }).overrideProvider(JwtService).useValue(jwt).compile();
      const app = moduleRef.createNestApplication();
      apps.push(app);
      app.setGlobalPrefix('api');
      await app.init();
      clients.push(app.get(PrismaService));
    }
    const identities = await Promise.all(clients.map((client) =>
      client.$queryRaw<Array<{ database: string; pid: number }>>`
        SELECT current_database() AS database, pg_backend_pid() AS pid
      `,
    ));
    expect(identities.map(([identity]) => identity.database)).toEqual([DATABASE, DATABASE]);
    expect(identities[0][0].pid).not.toBe(identities[1][0].pid);
    expect(await clients[0].user.findUnique({ where: { id: userId }, select: { id: true } })).not.toBeNull();
    token = jwt.sign({ sub: userId, roleTag: 'titulado' });
  }, TEST_TIMEOUT);

  afterEach(async () => {
    vi.restoreAllMocks();
    if (createdIds.length > 0) {
      await clients[0].education.deleteMany({ where: { id: { in: createdIds }, userId } });
      createdIds.length = 0;
    }
  });

  afterAll(async () => {
    await Promise.all(apps.map((app) => app.close()));
  });

  async function createFixture(endDate: Date | null) {
    const record = await clients[0].education.create({
      data: { userId, institution: 'Test University', degree: 'Engineering', startDate: new Date('2020-01-01'), endDate },
      select: { id: true },
    });
    createdIds.push(record.id);
    return record.id;
  }

  it('persists a description edit without replacing a legacy null end date', async () => {
    const id = await createFixture(null);
    await request(apps[0].getHttpServer()).patch(`/api/educations/${id}`)
      .set('Authorization', `Bearer ${token}`).send({ description: 'Updated description' })
      .timeout({ deadline: REQUEST_TIMEOUT }).expect(200);
    const stored = await clients[1].education.findUniqueOrThrow({
      where: { id }, select: { endDate: true, description: true },
    });
    expect(stored).toEqual({ endDate: null, description: 'Updated description' });
  }, TEST_TIMEOUT);

  it.each([new Date('2024-01-01'), null])(
    'rejects one stale PATCH after both connections read the same dates (end: %s)',
    async (endDate) => {
      const id = await createFixture(endDate);
      let arrivals = 0;
      let release!: () => void;
      const bothRead = new Promise<void>((resolve) => { release = resolve; });
      const timer = setTimeout(release, REQUEST_TIMEOUT);
      const repositories = apps.map((app) => app.get(EducationsRepository));
      for (const repository of repositories) {
        const originalRead = repository.findByIdAndUserId.bind(repository);
        // Synchronize actual PostgreSQL reads; no query or write is mocked.
        vi.spyOn(repository, 'findByIdAndUserId').mockImplementationOnce(async (...args) => {
          const record = await originalRead(...args);
          arrivals += 1;
          if (arrivals === repositories.length) release();
          await bothRead;
          return record;
        });
      }
      try {
        const responses = await Promise.all([
          request(apps[0].getHttpServer()).patch(`/api/educations/${id}`)
            .set('Authorization', `Bearer ${token}`).send({ startDate: '2023-01-01' })
            .timeout({ deadline: REQUEST_TIMEOUT }),
          request(apps[1].getHttpServer()).patch(`/api/educations/${id}`)
            .set('Authorization', `Bearer ${token}`).send({ endDate: '2022-01-01' })
            .timeout({ deadline: REQUEST_TIMEOUT }),
        ]);
        expect(arrivals).toBe(2);
        expect(responses.map((response) => response.status).sort((left, right) => left - right)).toEqual([200, 409]);
        expect(responses.find((response) => response.status === 409)?.body).toMatchObject({ ok: false, data: null });
        const stored = await clients[0].education.findUniqueOrThrow({
          where: { id }, select: { startDate: true, endDate: true },
        });
        expect(stored.endDate === null || stored.endDate >= stored.startDate).toBe(true);
      } finally {
        release();
        clearTimeout(timer);
      }
    }, TEST_TIMEOUT,
  );

  it('returns 404 when the row is deleted after the validation read', async () => {
    const id = await createFixture(new Date('2024-01-01'));
    const repository = apps[0].get(EducationsRepository);
    const originalRead = repository.findByIdAndUserId.bind(repository);
    vi.spyOn(repository, 'findByIdAndUserId').mockImplementationOnce(async (...args) => {
      const record = await originalRead(...args);
      await clients[1].education.deleteMany({ where: { id, userId } });
      return record;
    });
    await request(apps[0].getHttpServer()).patch(`/api/educations/${id}`)
      .set('Authorization', `Bearer ${token}`).send({ description: 'Deleted elsewhere' })
      .timeout({ deadline: REQUEST_TIMEOUT }).expect(404);
  }, TEST_TIMEOUT);
});
