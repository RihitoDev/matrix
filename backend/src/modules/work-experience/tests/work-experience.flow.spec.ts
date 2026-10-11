import type { INestApplication } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DomainExceptionFilter } from '../../../common/filters/domain-exception.filter.js';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
import { WorkExperienceRepository } from '../repositories/work-experience.repository.js';
import type { WorkExperiencePeriodSnapshot } from '../types/work-experience-period-snapshot.type.js';
import type { WorkExperienceRecord } from '../types/work-experience-record.type.js';
import type { WorkExperienceWriteData } from '../types/work-experience-write-data.type.js';
import { WorkExperienceModule } from '../work-experience.module.js';

const ownerId = '11111111-1111-4111-8111-111111111111';
const otherUserId = '22222222-2222-4222-8222-222222222222';

function createInMemoryRepository() {
  const records = new Map<string, WorkExperienceRecord>();
  let sequence = 0;

  const findOwned = (id: string, userId: string) => {
    const record = records.get(id);
    return record && record.userId === userId ? record : null;
  };

  const toCompany = (companyName: string) => ({
    id: `company-${companyName}`,
    title: companyName,
  });

  return {
    findManyByUserId: (userId: string) =>
      Promise.resolve(
        [...records.values()]
          .filter((record) => record.userId === userId)
          .sort(
            (first, second) =>
              Number(second.isCurrent) - Number(first.isCurrent) ||
              second.startDate.getTime() - first.startDate.getTime(),
          ),
      ),
    findByIdAndUserId: (id: string, userId: string) =>
      Promise.resolve(findOwned(id, userId)),
    create: (userId: string, data: WorkExperienceWriteData) => {
      const { companyName, ...fields } = data;
      sequence += 1;
      const now = new Date();
      const record: WorkExperienceRecord = {
        id: `00000000-0000-4000-8000-${String(sequence).padStart(12, '0')}`,
        userId,
        ...fields,
        createdAt: now,
        updatedAt: now,
        company: toCompany(companyName),
      };
      records.set(record.id, record);
      return Promise.resolve(record);
    },
    update: (
      id: string,
      userId: string,
      data: Partial<WorkExperienceWriteData>,
      expectedPeriod: WorkExperiencePeriodSnapshot,
    ) => {
      const current = findOwned(id, userId);
      if (
        !current ||
        current.startDate.getTime() !== expectedPeriod.startDate.getTime() ||
        current.endDate?.getTime() !== expectedPeriod.endDate?.getTime() ||
        current.isCurrent !== expectedPeriod.isCurrent
      ) {
        return Promise.resolve(null);
      }
      const { companyName, ...fields } = data;
      const changes = Object.fromEntries(
        Object.entries(fields).filter(([, value]) => value !== undefined),
      );
      const updated: WorkExperienceRecord = {
        ...current,
        ...changes,
        ...(companyName === undefined ? {} : { company: toCompany(companyName) }),
        updatedAt: new Date(),
      };
      records.set(id, updated);
      return Promise.resolve(updated);
    },
    delete: (id: string, userId: string) =>
      Promise.resolve(findOwned(id, userId) ? records.delete(id) : false),
  };
}

describe('Work experience flow', () => {
  let app: INestApplication;
  let ownerToken: string;
  let otherToken: string;
  const jwt = new JwtService({ secret: 'work-experience-flow-secret' });

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [WorkExperienceModule],
      providers: [{ provide: APP_FILTER, useClass: DomainExceptionFilter }],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .overrideProvider(JwtService)
      .useValue(jwt)
      .overrideProvider(WorkExperienceRepository)
      .useValue(createInMemoryRepository())
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
    ownerToken = jwt.sign({ sub: ownerId, roleTag: 'titulado' });
    otherToken = jwt.sign({ sub: otherUserId, roleTag: 'titulado' });
  });

  afterEach(async () => {
    await app.close();
  });

  const listAs = async (token: string) =>
    (
      await request(app.getHttpServer())
        .get('/api/work-experiences')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
    ).body.data as { id: string; position: string; companyName: string }[];

  const createAs = async (token: string, body: Record<string, unknown>) =>
    (
      await request(app.getHttpServer())
        .post('/api/work-experiences')
        .set('Authorization', `Bearer ${token}`)
        .send(body)
        .expect(201)
    ).body.data as { id: string };

  it('creates, edits and deletes several experiences while keeping the rest', async () => {
    const oldest = await createAs(ownerToken, {
      companyName: 'Tecnored',
      position: 'Asistente de laboratorio',
      startDate: '2023-03-01',
      endDate: '2024-12-31',
      isCurrent: false,
    });
    const recent = await createAs(ownerToken, {
      companyName: 'UMSS',
      position: 'Practicante de soporte',
      startDate: '2024-07-01',
      endDate: '2024-12-31',
      isCurrent: false,
    });
    const current = await createAs(ownerToken, {
      companyName: 'Synapse Labs',
      position: 'Desarrolladora web junior',
      startDate: '2025-03-01',
      isCurrent: true,
      description: 'Interfaces con React',
    });

    expect((await listAs(ownerToken)).map((item) => item.id)).toEqual([
      current.id,
      recent.id,
      oldest.id,
    ]);

    const edited = await request(app.getHttpServer())
      .patch(`/api/work-experiences/${recent.id}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ position: 'Técnico de soporte', companyName: 'UMSS FCyT' })
      .expect(200);
    expect(edited.body.data).toMatchObject({
      position: 'Técnico de soporte',
      companyName: 'UMSS FCyT',
      startDate: '2024-07-01',
    });

    await request(app.getHttpServer())
      .patch(`/api/work-experiences/${oldest.id}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ endDate: '2022-01-31' })
      .expect(400);

    await request(app.getHttpServer())
      .delete(`/api/work-experiences/${oldest.id}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .expect(200);

    const remaining = await listAs(ownerToken);
    expect(remaining).toHaveLength(2);
    expect(remaining).toEqual([
      expect.objectContaining({
        id: current.id,
        position: 'Desarrolladora web junior',
      }),
      expect.objectContaining({
        id: recent.id,
        position: 'Técnico de soporte',
        companyName: 'UMSS FCyT',
      }),
    ]);
  });

  it('keeps each user experiences separated', async () => {
    const owned = await createAs(ownerToken, {
      companyName: 'Synapse Labs',
      position: 'Desarrolladora web junior',
      startDate: '2025-03-01',
      isCurrent: true,
    });

    expect(await listAs(otherToken)).toEqual([]);

    await request(app.getHttpServer())
      .patch(`/api/work-experiences/${owned.id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ position: 'Otro cargo' })
      .expect(404);
    await request(app.getHttpServer())
      .delete(`/api/work-experiences/${owned.id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(404);

    expect(await listAs(ownerToken)).toEqual([
      expect.objectContaining({
        id: owned.id,
        position: 'Desarrolladora web junior',
      }),
    ]);
  });
});
