import type { INestApplication } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DomainExceptionFilter } from '../../../common/filters/domain-exception.filter.js';
import { ResponseInterceptor } from '../../../common/interceptors/response.interceptor.js';
import { PrismaModule } from '../../../common/prisma/prisma.module.js';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
import { ProfilePhotoService } from '../../profile/services/profile-photo.service.js';
import { MentorsModule } from '../mentors.module.js';
import { MentorsRepository } from '../repositories/mentors.repository.js';

const userId = '11111111-1111-4111-8111-111111111111';
const photoPath = `/api/mentors/${userId}/photo`;
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a9S8AAAAASUVORK5CYII=',
  'base64',
);
const jpeg = Buffer.concat([
  Buffer.from([0xff, 0xd8, 0xff, 0xe0]),
  Buffer.alloc(50),
  Buffer.from([0xff, 0xd9]),
]);

describe('Mentor photo HTTP integration', () => {
  let app: INestApplication;
  let photoService: ProfilePhotoService;
  let content: Uint8Array | null;
  let exists: boolean;
  let isActive: boolean;
  let roleName: string;
  let deletedAt: Date | null;
  let startAt: Date;
  let findActiveMentor: ReturnType<typeof vi.spyOn>;
  const findUnique = vi.fn();

  beforeEach(async () => {
    content = png;
    exists = true;
    isActive = true;
    roleName = 'mentor';
    deletedAt = null;
    startAt = new Date('2020-01-01');
    findUnique
      .mockReset()
      .mockImplementation(() =>
        Promise.resolve({ id: userId, photoUrl: content }),
      );
    const moduleRef = await Test.createTestingModule({
      imports: [PrismaModule, MentorsModule],
      providers: [
        { provide: APP_FILTER, useClass: DomainExceptionFilter },
        { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
      ],
    })
      .overrideProvider(PrismaService)
      .useValue({
        user: {
          findUnique,
          findFirst: vi.fn().mockImplementation(
            ({
              where,
            }: {
              where: {
                id: string;
                isActive?: boolean;
                roles?: {
                  some: {
                    deletedAt: null;
                    startAt: { lte: Date };
                    role: { name: string };
                  };
                };
              };
            }) => {
              const role = where.roles?.some;
              const eligible =
                exists &&
                where.id === userId &&
                (role
                  ? isActive === where.isActive &&
                    roleName === role.role.name &&
                    deletedAt === role.deletedAt &&
                    startAt <= role.startAt.lte
                  : content !== null);
              return Promise.resolve(eligible ? { id: userId } : null);
            },
          ),
          update: vi
            .fn()
            .mockImplementation(
              ({ data }: { data: { photoUrl: Uint8Array | null } }) => {
                content = data.photoUrl;
                return Promise.resolve({ id: userId });
              },
            ),
        },
      })
      .compile();

    findActiveMentor = vi.spyOn(
      moduleRef.get(MentorsRepository),
      'findActiveMentorParticipation',
    );
    photoService = moduleRef.get(ProfilePhotoService);
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterEach(async () => {
    await app?.close();
    vi.restoreAllMocks();
  });

  it.each([
    { bytes: png, mime: 'image/png' },
    { bytes: jpeg, mime: 'image/jpeg' },
  ])(
    'returns original $mime bytes through the global interceptor',
    async ({ bytes, mime }) => {
      content = bytes;
      const response = await request(app.getHttpServer())
        .get(photoPath)
        .expect(200);
      expect(response.body).toEqual(bytes);
      expect(response.headers['content-type']).toBe(mime);
      expect(response.headers['content-length']).toBe(String(bytes.length));
      expect(response.headers['content-disposition']).toBe('inline');
      expect(response.headers['cache-control']).toBe('no-store');
      expect(findActiveMentor).toHaveBeenCalledWith(userId, expect.any(Date));
    },
  );

  it('returns 404 when the active mentor has no photo', async () => {
    content = null;
    await request(app.getHttpServer()).get(photoPath).expect(404);
  });

  it.each(['missing', 'inactive', 'non-mentor', 'revoked', 'future'])(
    'rejects a %s mentor before reading any photo',
    async (state) => {
      if (state === 'missing') exists = false;
      if (state === 'inactive') isActive = false;
      if (state === 'non-mentor') roleName = 'titulado';
      if (state === 'revoked') deletedAt = new Date();
      if (state === 'future') startAt = new Date('2999-01-01');
      await request(app.getHttpServer()).get(photoPath).expect(404);
      expect(findUnique).not.toHaveBeenCalled();
    },
  );

  it('rejects invalid UUIDs before querying eligibility or photo storage', async () => {
    await request(app.getHttpServer())
      .get('/api/mentors/invalid/photo')
      .expect(400);
    expect(findActiveMentor).not.toHaveBeenCalled();
    expect(findUnique).not.toHaveBeenCalled();
  });

  it('reads changes uploaded through Epic 2 and stops serving deleted photos', async () => {
    const api = request(app.getHttpServer());
    expect((await api.get(photoPath).expect(200)).body).toEqual(png);
    await photoService.upload(userId, {
      originalname: 'photo.jpg',
      mimetype: 'image/jpeg',
      size: jpeg.length,
      buffer: jpeg,
    });
    const updated = await api.get(`${photoPath}?v=old-version`).expect(200);
    expect(updated.body).toEqual(jpeg);
    expect(updated.headers['content-type']).toBe('image/jpeg');
    await photoService.remove(userId);
    await api.get(photoPath).expect(404);
  });

  it('rechecks mentor eligibility even if the photo was previously available', async () => {
    await request(app.getHttpServer()).get(photoPath).expect(200);
    findUnique.mockClear();
    isActive = false;
    await request(app.getHttpServer()).get(photoPath).expect(404);
    expect(findUnique).not.toHaveBeenCalled();
  });

  it.each(['get', 'put', 'delete'] as const)(
    'keeps Epic 2 %s protected',
    async (method) => {
      const response = await request(app.getHttpServer())[method](
        '/api/profile/me/photo',
      );
      expect(response.status).toBe(401);
      expect(findUnique).not.toHaveBeenCalled();
    },
  );
});
