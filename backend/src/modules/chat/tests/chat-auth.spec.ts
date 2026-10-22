import type { INestApplication } from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { APP_FILTER } from '@nestjs/core';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DomainExceptionFilter } from '../../../common/filters/domain-exception.filter.js';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../../common/guards/roles.guard.js';
import { ROLES_KEY } from '../../../common/constants/roles.constants.js';
import { SessionModule } from '../../../common/session/session.module.js';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
import { ChatController } from '../controllers/chat.controller.js';
import { ConversationController } from '../controllers/conversation.controller.js';
import { MessageController } from '../controllers/message.controller.js';
import { UserSearchController } from '../controllers/user-search.controller.js';
import { ConversationService } from '../services/conversation.service.js';

describe('Chat access', () => {
  let app: INestApplication;
  let token: string;
  const findFirst = vi.fn();
  const findAllForUser = vi.fn().mockResolvedValue([]);

  beforeEach(async () => {
    findFirst.mockReset();
    findAllForUser.mockClear();
    const moduleRef = await Test.createTestingModule({
      imports: [SessionModule, JwtModule.register({ secret: 'chat-role-test-secret' })],
      controllers: [ConversationController],
      providers: [
        { provide: ConversationService, useValue: { findAllForUser } },
        { provide: APP_FILTER, useClass: DomainExceptionFilter },
      ],
    })
      .overrideProvider(PrismaService)
      .useValue({ user: { findFirst } })
      .compile();
    app = moduleRef.createNestApplication();
    await app.init();
    token = moduleRef.get(JwtService).sign({
      sub: 'user-1', roleTag: 'administrativo', roles: ['administrativo', 'mentor'],
    });
  });

  afterEach(async () => {
    await app.close();
  });

  it.each([
    [['administrativo'], 403],
    [['administrativo', 'mentor'], 200],
    [['titulado'], 200],
    [['estudiante'], 200],
    [['mentor'], 200],
    [['empresa'], 200],
    [['empresa', 'titulado'], 200],
  ])('uses current database roles %s to allow or deny direct requests', async (roles, statusCode) => {
    findFirst.mockResolvedValue({
      id: 'user-1', email: 'user@test.com', roles: roles.map((name) => ({ role: { name } })),
    });
    await request(app.getHttpServer()).get('/chat/conversations')
      .set('Authorization', `Bearer ${token}`).expect(statusCode);
    if (statusCode === 403) expect(findAllForUser).not.toHaveBeenCalled();
    else expect(findAllForUser).toHaveBeenCalledWith('user-1');
  });

  it.each([ChatController, ConversationController, MessageController, UserSearchController])(
    'protects all endpoints of %p with the same chat roles', (controller) => {
      expect(Reflect.getMetadata(GUARDS_METADATA, controller)).toEqual([JwtAuthGuard, RolesGuard]);
      expect(Reflect.getMetadata(ROLES_KEY, controller)).toEqual(['titulado', 'estudiante', 'mentor', 'empresa']);
    },
  );
});
