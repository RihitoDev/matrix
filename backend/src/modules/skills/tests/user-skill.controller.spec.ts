import type { INestApplication } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DomainExceptionFilter } from '../../../common/filters/domain-exception.filter.js';
import { UserSkillController } from '../controllers/user-skill.controller.js';
import { DuplicateSkillException } from '../exceptions/duplicate-skill.exception.js';
import { UserSkillService } from '../services/user-skill.service.js';

const userId = '11111111-1111-4111-8111-111111111111';
const pythonId = '33333333-3333-4333-8333-333333333333';
const python = { id: pythonId, name: 'Python', isCustom: false };

describe('UserSkillController', () => {
  let app: INestApplication;
  let token: string;
  let service: {
    getUserSkills: ReturnType<typeof vi.fn>;
    updateUserSkills: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    service = {
      getUserSkills: vi.fn().mockResolvedValue([python]),
      updateUserSkills: vi.fn().mockResolvedValue([python]),
    };

    const moduleRef = await Test.createTestingModule({
      imports: [JwtModule.register({ global: true, secret: 'test-secret' })],
      controllers: [UserSkillController],
      providers: [
        { provide: UserSkillService, useValue: service },
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

  it('returns the skills of the token user in the standard response', async () => {
    const response = await request(app.getHttpServer())
      .get('/profile/me/skills')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toEqual({ statusCode: 200, data: [python], detail: 'OK', ok: true });
    expect(service.getUserSkills).toHaveBeenCalledWith(userId);
  });

  it('saves the skills of the token user', async () => {
    await request(app.getHttpServer())
      .put('/profile/me/skills')
      .set('Authorization', `Bearer ${token}`)
      .send({ skillIds: [pythonId] })
      .expect(200);

    expect(service.updateUserSkills).toHaveBeenCalledWith(userId, { skillIds: [pythonId] });
  });

  it('rejects skill ids that are not uuids', async () => {
    const response = await request(app.getHttpServer())
      .put('/profile/me/skills')
      .set('Authorization', `Bearer ${token}`)
      .send({ skillIds: ['python'] })
      .expect(400);

    expect(response.body.ok).toBe(false);
    expect(response.body.detail).toContain('skillIds');
    expect(service.updateUserSkills).not.toHaveBeenCalled();
  });

  it('returns a conflict when the service detects a duplicated skill', async () => {
    service.updateUserSkills.mockRejectedValue(new DuplicateSkillException());

    const response = await request(app.getHttpServer())
      .put('/profile/me/skills')
      .set('Authorization', `Bearer ${token}`)
      .send({ skillIds: [pythonId, pythonId] })
      .expect(409);

    expect(response.body).toEqual({
      statusCode: 409,
      data: null,
      detail: 'The same skill cannot be added twice',
      ok: false,
    });
  });

  it('rejects a request without a token', async () => {
    await request(app.getHttpServer()).get('/profile/me/skills').expect(401);

    expect(service.getUserSkills).not.toHaveBeenCalled();
  });
});
