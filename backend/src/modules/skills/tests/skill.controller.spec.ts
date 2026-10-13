import type { INestApplication } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DomainExceptionFilter } from '../../../common/filters/domain-exception.filter.js';
import { SkillController } from '../controllers/skill.controller.js';
import { SkillCatalogService } from '../services/skill-catalog.service.js';

const userId = '11111111-1111-4111-8111-111111111111';
const python = { id: '33333333-3333-4333-8333-333333333333', name: 'Python', isCustom: false };

describe('SkillController', () => {
  let app: INestApplication;
  let token: string;
  let service: {
    listCatalog: ReturnType<typeof vi.fn>;
    createCustomSkill: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    service = {
      listCatalog: vi.fn().mockResolvedValue([python]),
      createCustomSkill: vi.fn().mockResolvedValue(python),
    };

    const moduleRef = await Test.createTestingModule({
      imports: [JwtModule.register({ global: true, secret: 'test-secret' })],
      controllers: [SkillController],
      providers: [
        { provide: SkillCatalogService, useValue: service },
        { provide: APP_FILTER, useClass: DomainExceptionFilter },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    token = moduleRef.get(JwtService).sign({ sub: userId, roleTag: 'titulado' });
  });

  afterEach(async () => {
    await app.close();
  });

  it('lists the catalog with the trimmed search term in the standard response', async () => {
    const response = await request(app.getHttpServer())
      .get('/skills')
      .query({ search: '  py ' })
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toEqual({ statusCode: 200, data: [python], detail: 'OK', ok: true });
    expect(service.listCatalog).toHaveBeenCalledWith({ search: 'py' });
  });

  it('lists the catalog without a search term', async () => {
    await request(app.getHttpServer())
      .get('/skills')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(service.listCatalog).toHaveBeenCalledWith({});
  });

  it('rejects a search term that is too long', async () => {
    const response = await request(app.getHttpServer())
      .get('/skills')
      .query({ search: 'a'.repeat(101) })
      .set('Authorization', `Bearer ${token}`)
      .expect(400);

    expect(response.body.detail).toContain('search');
    expect(service.listCatalog).not.toHaveBeenCalled();
  });

  it('rejects a request without a token', async () => {
    await request(app.getHttpServer()).get('/skills').expect(401);
    await request(app.getHttpServer()).post('/skills/custom').send({ name: 'Python' }).expect(401);

    expect(service.listCatalog).not.toHaveBeenCalled();
    expect(service.createCustomSkill).not.toHaveBeenCalled();
  });

  it('registers a custom skill with the trimmed name', async () => {
    const response = await request(app.getHttpServer())
      .post('/skills/custom')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '  Python ' })
      .expect(201);

    expect(response.body).toEqual({ statusCode: 201, data: python, detail: 'OK', ok: true });
    expect(service.createCustomSkill).toHaveBeenCalledWith({ name: 'Python' });
  });

  it('rejects a custom skill with an empty name', async () => {
    const response = await request(app.getHttpServer())
      .post('/skills/custom')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '   ' })
      .expect(400);

    expect(response.body.detail).toContain('name');
    expect(service.createCustomSkill).not.toHaveBeenCalled();
  });
});
