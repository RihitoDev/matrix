import type { INestApplication } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DomainExceptionFilter } from '../../../common/filters/domain-exception.filter.js';
import { ProfileController } from '../controllers/profile.controller.js';
import { ProfileService } from '../services/profile.service.js';

const userId = '11111111-1111-4111-8111-111111111111';
const cityId = '22222222-2222-4222-8222-222222222222';

const profile = {
  id: userId,
  firstName: 'Valeria',
  lastName: 'Quispe',
  institutionalEmail: 'valeria.quispe@umss.edu.bo',
  personalEmail: null,
  phone: null,
  city: null,
  headline: null,
  aboutMe: null,
  updatedAt: '2026-10-04T12:00:00.000Z',
};

const personalInfo = {
  firstName: ' Valeria ',
  lastName: 'Quispe',
  cityId,
  phone: '+591 70000000',
  personalEmail: 'valeria@mail.com',
};

describe('ProfileController', () => {
  let app: INestApplication;
  let token: string;
  let service: {
    getProfile: ReturnType<typeof vi.fn>;
    updatePersonalInfo: ReturnType<typeof vi.fn>;
    updatePresentation: ReturnType<typeof vi.fn>;
    listCities: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    service = {
      getProfile: vi.fn().mockResolvedValue(profile),
      updatePersonalInfo: vi.fn().mockResolvedValue(profile),
      updatePresentation: vi.fn().mockResolvedValue(profile),
      listCities: vi.fn().mockResolvedValue([{ id: cityId, title: 'Cochabamba' }]),
    };

    const moduleRef = await Test.createTestingModule({
      imports: [JwtModule.register({ global: true, secret: 'test-secret' })],
      controllers: [ProfileController],
      providers: [
        { provide: ProfileService, useValue: service },
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

  it('returns the profile of the token user in the standard response', async () => {
    const response = await request(app.getHttpServer())
      .get('/profile/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toEqual({ statusCode: 200, data: profile, detail: 'OK', ok: true });
    expect(service.getProfile).toHaveBeenCalledWith(userId);
  });

  it('rejects a request without a token', async () => {
    const response = await request(app.getHttpServer()).get('/profile/me').expect(401);

    expect(response.body).toEqual({
      statusCode: 401,
      data: null,
      detail: 'Authenticated user is required',
      ok: false,
    });
    expect(service.getProfile).not.toHaveBeenCalled();
  });

  it('does not accept the user id from the x-user-id header', async () => {
    await request(app.getHttpServer()).get('/profile/me').set('x-user-id', userId).expect(401);
  });

  it('saves the personal info with the validated and trimmed body', async () => {
    await request(app.getHttpServer())
      .patch('/profile/me/personal-info')
      .set('Authorization', `Bearer ${token}`)
      .send(personalInfo)
      .expect(200);

    expect(service.updatePersonalInfo).toHaveBeenCalledWith(userId, {
      ...personalInfo,
      firstName: 'Valeria',
    });
  });

  it('rejects an invalid body with a validation error', async () => {
    const response = await request(app.getHttpServer())
      .patch('/profile/me/personal-info')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...personalInfo, personalEmail: 'valeria' })
      .expect(400);

    expect(response.body.ok).toBe(false);
    expect(response.body.detail).toContain('personalEmail');
    expect(service.updatePersonalInfo).not.toHaveBeenCalled();
  });

  it('saves the presentation', async () => {
    await request(app.getHttpServer())
      .patch('/profile/me/presentation')
      .set('Authorization', `Bearer ${token}`)
      .send({ headline: 'Junior web developer', aboutMe: 'Graduate.' })
      .expect(200);

    expect(service.updatePresentation).toHaveBeenCalledWith(userId, {
      headline: 'Junior web developer',
      aboutMe: 'Graduate.',
    });
  });

  it('lists the cities for an authenticated user', async () => {
    const response = await request(app.getHttpServer())
      .get('/profile/cities')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.data).toEqual([{ id: cityId, title: 'Cochabamba' }]);
  });
});
