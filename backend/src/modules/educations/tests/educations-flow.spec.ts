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
  institution: 'Universidad Mayor de San Simón (UMSS)',
  degree: 'Ingeniería Civil',
  startDate: '2020-01-01',
  endDate: '2024-01-01',
};

describe('Education HTTP flow', () => {
  let app: INestApplication;
  let token: string;
  let otherToken: string;
  const records = new Map<string, EducationRecord>();

  function matching(where: { id?: string | { not: string }; userId?: string; startDate?: Date; endDate?: Date | null }) {
    return [...records.values()].filter((record) =>
      (!where.userId || record.userId === where.userId)
      && (!where.id || (typeof where.id === 'string' ? record.id === where.id : record.id !== where.id.not))
      && (!where.startDate || record.startDate.getTime() === where.startDate.getTime())
      && (where.endDate === undefined || record.endDate?.getTime() === where.endDate?.getTime()),
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
        async $transaction(operation: (client: unknown) => Promise<unknown>) { return operation(this); },
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

  it('serves the authenticated catalogue without accessing persistence', async () => {
    const api = request(app.getHttpServer());
    await api.get('/api/educations/institutions').expect(401);
    const response = await api.get('/api/educations/institutions').set('Authorization', `Bearer ${token}`).expect(200);
    expect(response.body.data).toHaveLength(17);
    const names = response.body.data.map((institution: { name: string }) => institution.name);
    expect(names).toEqual(expect.arrayContaining(['Universidad Central (UNICEN)', 'Universidad Latinoamericana (ULAT)', 'Universidad Villa de Oropesa (UNIVIOR)']));
    for (const name of ['Universidad Privada Abierta Latinoamericana (UPAL)', 'Universidad NUR', 'Universidad Pedagógica']) {
      expect(names).not.toContain(name);
    }
    expect(records.size).toBe(0);
  });

  it('validates university and degree together on POST and partial PATCH, preserving ownership checks', async () => {
    const api = request(app.getHttpServer());
    const post = (payload: object) => api.post('/api/educations').set('Authorization', `Bearer ${token}`).send(payload);
    for (const degree of ['ggggg', 'Medicina', 'Ingeniería en Inteligencia Artificial']) {
      const response = await post({ ...body, degree }).expect(400);
      expect(response.body.errors).toEqual(expect.arrayContaining([expect.objectContaining({ field: 'degree' })]));
    }
    const created = await post({ ...body, degree: '  ingenieria en informatica ' }).expect(201);
    expect(created.body.data.degree).toBe('Ingeniería Informática');
    const id = created.body.data.id;
    const patch = (payload: object) => api.patch(`/api/educations/${id}`).set('Authorization', `Bearer ${token}`).send(payload);
    await patch({ institution: 'UPB' }).expect(400);
    await patch({ degree: 'Ingeniería en Inteligencia Artificial' }).expect(400);
    expect(records.get(id)?.degree).toBe('Ingeniería Informática');
    await api.patch(`/api/educations/${id}`).set('Authorization', `Bearer ${otherToken}`)
      .send({ degree: 'Unknown' }).expect(404);
    const updated = await patch({ institution: 'UPB', degree: 'Ingeniería de Inteligencia Artificial' }).expect(200);
    expect(updated.body.data).toMatchObject({ institution: 'Universidad Privada Boliviana (UPB)', degree: 'Ingeniería en Inteligencia Artificial' });
    await patch({ description: 'Updated' }).expect(200);
    await patch({ institution: 'UMSS' }).expect(400);
    expect(records.size).toBe(1);
  });

  it('detects duplicate records through degree aliases, including legacy stored names', async () => {
    const api = request(app.getHttpServer());
    const first = await api.post('/api/educations').set('Authorization', `Bearer ${token}`)
      .send({ ...body, degree: 'Ingeniería Informática' }).expect(201);
    records.get(first.body.data.id)!.degree = 'Ingeniería en Informática';
    await api.post('/api/educations').set('Authorization', `Bearer ${token}`)
      .send({ ...body, degree: 'Ingeniería Informática' }).expect(409);
    expect(records.size).toBe(1);
  });

  it('rejects invalid institutions and early dates on POST and PATCH without changing records', async () => {
    const api = request(app.getHttpServer());
    const created = await api.post('/api/educations').set('Authorization', `Bearer ${token}`).send(body).expect(201);
    for (const change of [{ institution: 'gggggg' }, { institution: 'UNIPOL' }, { institution: 'UPAL' }, { institution: 'NUR' }, { institution: 'Universidad Pedagógica' }, { startDate: '0201-01-01' }, { endDate: '1939-12-31' }]) {
      const response = await api.post('/api/educations').set('Authorization', `Bearer ${token}`).send({ ...body, ...change }).expect(400);
      expect(response.body.errors).toEqual(expect.arrayContaining([expect.objectContaining({ field: Object.keys(change)[0] })]));
      await api.patch(`/api/educations/${created.body.data.id}`).set('Authorization', `Bearer ${token}`).send(change).expect(400);
    }
    const listed = await api.get('/api/educations').set('Authorization', `Bearer ${token}`).expect(200);
    expect(listed.body.data).toEqual([created.body.data]);
  });

  it('rejects duplicate creates and edits while allowing another owner, degree or period', async () => {
    const api = request(app.getHttpServer());
    const post = (payload: object, accessToken = token) => api.post('/api/educations')
      .set('Authorization', `Bearer ${accessToken}`).send(payload);
    const first = await post(body).expect(201);
    const duplicate = await post({ ...body, institution: ' umss ', degree: '  INGENIERIA CIVIL ', description: 'Different text' }).expect(409);
    expect(duplicate.body.data.code).toBe('EDUCATION_DUPLICATE');
    expect(records.size).toBe(1);
    await post(body, otherToken).expect(201);
    const differentDegree = await post({ ...body, degree: 'Licenciatura en Química' }).expect(201);
    await post({ ...body, startDate: '2019-01-01' }).expect(201);
    const collision = await api.patch(`/api/educations/${differentDegree.body.data.id}`)
      .set('Authorization', `Bearer ${token}`).send({ degree: 'ingenieria civil' }).expect(409);
    expect(collision.body.data.code).toBe('EDUCATION_DUPLICATE');
    expect(records.get(differentDegree.body.data.id)?.degree).toBe('Licenciatura en Química');
    await api.patch(`/api/educations/${first.body.data.id}`)
      .set('Authorization', `Bearer ${token}`).send({ degree: 'Ingeniería Civil', description: 'Updated' }).expect(200);
    expect(records.size).toBe(4);
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
      .send({ ...body, degree: 'Ingeniería Electromecánica' })
      .expect(201);
    const other = await api
      .post('/api/educations')
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ ...body, degree: 'Ingeniería Eléctrica' })
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
      .send({ degree: 'Ingeniería Química' })
      .expect(200);
    expect(edited.body.data.degree).toBe('Ingeniería Química');
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
