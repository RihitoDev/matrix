import { randomUUID } from 'node:crypto';
import type { INestApplication } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DomainExceptionFilter } from '../../../common/filters/domain-exception.filter.js';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
import { EducationsModule } from '../educations.module.js';
import type { CreateEducationRequest } from '../requests/create-education.request.js';
import type { UpdateEducationRequest } from '../requests/update-education.request.js';
import type { EducationRecord } from '../types/education-record.type.js';
import type { EducationPeriodSnapshot } from '../types/education-period-snapshot.type.js';

const userId = '11111111-1111-4111-8111-111111111111';
const otherUserId = '22222222-2222-4222-8222-222222222222';
const body = {
  institution: 'University',
  degree: 'Engineering',
  startDate: '2020-01-01',
  endDate: '2024-01-01',
};

// The HTTP stack and repository are real; persistence is isolated to this test.
describe('Education HTTP flow', () => {
  let app: INestApplication;
  let token: string;
  let otherToken: string;
  const records = new Map<string, EducationRecord>();

  function matching(where: Partial<Pick<EducationRecord, 'id' | 'userId'>>) {
    return [...records.values()].filter((record) =>
      Object.entries(where).every(
        ([key, value]) => record[key as 'id' | 'userId'] === value,
      ),
    );
  }

  beforeEach(async () => {
    records.clear();
    const jwt = new JwtService({ secret: 'education-flow-test-secret' });
    const moduleRef = await Test.createTestingModule({
      imports: [EducationsModule],
      providers: [{ provide: APP_FILTER, useClass: DomainExceptionFilter }],
    })
      .overrideProvider(JwtService)
      .useValue(jwt)
      .overrideProvider(PrismaService)
      .useValue({
        education: {
          create: ({
            data,
          }: {
            data: CreateEducationRequest & { userId: string };
          }) => {
            const record: EducationRecord = {
              ...data,
              id: randomUUID(),
              description: data.description ?? null,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            records.set(record.id, record);
            return Promise.resolve(record);
          },
          findMany: ({ where }: { where: { userId: string } }) =>
            Promise.resolve(matching(where)),
          findFirst: ({ where }: { where: { id: string; userId: string } }) =>
            Promise.resolve(matching(where)[0] ?? null),
          updateManyAndReturn: ({
            where,
            data,
          }: {
            where: { id: string; userId: string } & EducationPeriodSnapshot;
            data: UpdateEducationRequest;
          }) => {
            const updated = matching({ id: where.id, userId: where.userId })
              .filter((record) => record.startDate.getTime() === where.startDate.getTime()
                && record.endDate?.getTime() === where.endDate?.getTime())
              .map((record) => ({
              ...record,
              ...data,
              updatedAt: new Date(),
            }));
            updated.forEach((record) => records.set(record.id, record));
            return Promise.resolve(updated);
          },
          deleteMany: ({
            where,
          }: {
            where: { id: string; userId: string };
          }) => {
            const deleted = matching(where);
            deleted.forEach((record) => records.delete(record.id));
            return Promise.resolve({ count: deleted.length });
          },
        },
      })
      .compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
    token = jwt.sign({ sub: userId, roleTag: 'titulado' });
    otherToken = jwt.sign({ sub: otherUserId, roleTag: 'titulado' });
  });

  afterEach(async () => {
    await app.close();
  });

  it('creates multiple records, isolates owners, edits and deletes through authenticated requests', async () => {
    const api = request(app.getHttpServer());
    const first = await api
      .post('/api/educations')
      .set('Authorization', `Bearer ${token}`)
      .send(body)
      .expect(201);
    const second = await api
      .post('/api/educations')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...body, degree: 'Data Science' })
      .expect(201);
    const other = await api
      .post('/api/educations')
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ ...body, degree: 'Architecture' })
      .expect(201);
    expect(records.get(first.body.data.id)?.userId).toBe(userId);
    expect(records.get(other.body.data.id)?.userId).toBe(otherUserId);

    const listed = await api
      .get('/api/educations')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(listed.body.data.map((record: { id: string }) => record.id)).toEqual(
      [first.body.data.id, second.body.data.id],
    );
    expect(listed.body.data[0]).not.toHaveProperty('userId');
    const otherList = await api
      .get('/api/educations')
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(200);
    expect(otherList.body.data).toEqual([other.body.data]);

    await api
      .patch(`/api/educations/${first.body.data.id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ degree: 'Unauthorized edit' })
      .expect(404);
    await api
      .delete(`/api/educations/${first.body.data.id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(404);
    expect(records.get(first.body.data.id)?.degree).toBe(body.degree);
    expect(records.size).toBe(3);

    const edited = await api
      .patch(`/api/educations/${first.body.data.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ degree: 'Updated Engineering' })
      .expect(200);
    expect(edited.body.data.degree).toBe('Updated Engineering');
    const afterEdit = await api
      .get('/api/educations')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(afterEdit.body.data).toContainEqual(edited.body.data);
    const deleted = await api
      .delete(`/api/educations/${first.body.data.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(deleted.body).toMatchObject({ ok: true, data: null });
    const afterDelete = await api
      .get('/api/educations')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(afterDelete.body.data).toEqual([second.body.data]);
    const otherAfterDelete = await api
      .get('/api/educations')
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(200);
    expect(otherAfterDelete.body.data).toEqual([other.body.data]);
  });

  it('rejects invalid writes without changing stored data and accepts same-day dates without a description', async () => {
    const api = request(app.getHttpServer());
    for (const field of ['institution', 'degree', 'startDate', 'endDate']) {
      for (const value of [undefined, null, '', ' ']) {
        await api
          .post('/api/educations')
          .set('Authorization', `Bearer ${token}`)
          .send({ ...body, [field]: value })
          .expect(400);
      }
    }
    await api
      .post('/api/educations')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...body, endDate: '2019-12-31' })
      .expect(400);
    expect(records.size).toBe(0);
    const created = await api
      .post('/api/educations')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...body, endDate: body.startDate })
      .expect(201);
    expect(created.body.data.description).toBeNull();
    for (const change of [
      { endDate: null },
      { startDate: '2024-01-01' },
      { endDate: '2019-12-31' },
    ]) {
      await api
        .patch(`/api/educations/${created.body.data.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(change)
        .expect(400);
    }
    const listed = await api
      .get('/api/educations')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(listed.body.data).toEqual([created.body.data]);
  });
});
