import { describe, expect, it, vi } from 'vitest';
import { ConversationService } from './conversation.service.js';
import type { ConversationRepository } from '../repositories/conversation.repository.js';
import type { ConversationParticipantRepository } from '../repositories/conversation-participant.repository.js';
import type { UserLookupRepository } from '../repositories/user-lookup.repository.js';
import type { UserPresenceService } from './user-presence.service.js';

describe('ConversationService', () => {
  it('findAllForUser maps and returns conversations for the current user', async () => {
    const conversationRepositoryMock = {
      findUserConversations: vi.fn().mockResolvedValue([
        {
          id: 'conv-1',
          userAId: 'user-current',
          userBId: 'user-contact',
          updatedAt: new Date('2026-01-02T10:00:00Z'),
          userA: { id: 'user-current', firstName: 'Current', lastName: 'User' },
          userB: { id: 'user-contact', firstName: 'Contact', lastName: 'Person' },
          messages: [
            {
              id: 'msg-1',
              senderId: 'user-contact',
              content: 'Hola',
              sentAt: new Date('2026-01-02T10:00:00Z'),
            },
          ],
        },
      ]),
    } as unknown as ConversationRepository;

    const participantRepositoryMock = {
      findByConversationAndUser: vi.fn().mockResolvedValue({
        lastReadAt: new Date('2026-01-01T10:00:00Z'),
      }),
      countUnread: vi.fn().mockResolvedValue(1),
    } as unknown as ConversationParticipantRepository;

    const userLookupRepositoryMock = {} as unknown as UserLookupRepository;

    const userPresenceServiceMock = {
      mapOnlineStatus: vi.fn().mockResolvedValue(new Map([['user-contact', true]])),
    } as unknown as UserPresenceService;

    const service = new ConversationService(
      conversationRepositoryMock,
      participantRepositoryMock,
      userLookupRepositoryMock,
      userPresenceServiceMock,
    );

    const result = await service.findAllForUser('user-current');

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('conv-1');
    expect(result[0].contact.id).toBe('user-contact');
    expect(result[0].contact.fullName).toBe('Contact Person');
    expect(result[0].contact.isOnline).toBe(true);
    expect(result[0].unreadCount).toBe(1);
    expect(result[0].lastMessage?.content).toBe('Hola');
  });

  it('rejects self-conversation even when UUID has different casing', async () => {
    const service = new ConversationService(
      {} as unknown as ConversationRepository,
      {} as unknown as ConversationParticipantRepository,
      {} as unknown as UserLookupRepository,
      {} as unknown as UserPresenceService,
    );

    await expect(
      service.getOrCreate(
        '123e4567-e89b-12d3-a456-426614174000',
        '123E4567-E89B-12D3-A456-426614174000',
      ),
    ).rejects.toThrow('No es posible iniciar una conversación consigo mismo');
  });

  it('recovers gracefully from concurrent creation unique constraint collision (P2002)', async () => {
    const existingConv = {
      id: 'conv-concurrent',
      userAId: 'user-a',
      userBId: 'user-b',
      updatedAt: new Date('2026-01-01T00:00:00Z'),
      userA: { id: 'user-a', firstName: 'User', lastName: 'A', photoUrl: null },
      userB: { id: 'user-b', firstName: 'User', lastName: 'B', photoUrl: null },
      messages: [],
    };

    const conversationRepositoryMock = {
      findByOrderedPair: vi
        .fn()
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(existingConv),
      createWithParticipants: vi.fn().mockRejectedValue({
        code: 'P2002',
        message: 'Unique constraint failed on the fields: (user_a_id, user_b_id)',
      }),
    } as unknown as ConversationRepository;

    const userLookupRepositoryMock = {
      findById: vi.fn().mockResolvedValue({ id: 'user-b', isActive: true }),
    } as unknown as UserLookupRepository;

    const userPresenceServiceMock = {
      mapOnlineStatus: vi.fn().mockResolvedValue(new Map()),
    } as unknown as UserPresenceService;

    const participantRepositoryMock = {
      findByConversationAndUser: vi.fn().mockResolvedValue(null),
      countUnread: vi.fn().mockResolvedValue(0),
    } as unknown as ConversationParticipantRepository;

    const service = new ConversationService(
      conversationRepositoryMock,
      participantRepositoryMock,
      userLookupRepositoryMock,
      userPresenceServiceMock,
    );

    const result = await service.getOrCreateWithStatus('user-a', 'user-b');

    expect(result.isCreated).toBe(false);
    expect(result.conversation.id).toBe('conv-concurrent');
  });

  it('maps custom binary photo to base64 data URI in contact avatarUrl', async () => {
    const photoBuffer = Buffer.from('fake-image-binary-data');

    const conversationRepositoryMock = {
      findUserConversations: vi.fn().mockResolvedValue([
        {
          id: 'conv-photo',
          userAId: 'user-me',
          userBId: 'user-other',
          updatedAt: new Date('2026-01-01T00:00:00Z'),
          userA: { id: 'user-me', firstName: 'Me', lastName: 'Self' },
          userB: {
            id: 'user-other',
            firstName: 'Other',
            lastName: 'User',
            photoUrl: new Uint8Array(photoBuffer),
          },
          messages: [],
        },
      ]),
    } as unknown as ConversationRepository;

    const userPresenceServiceMock = {
      mapOnlineStatus: vi.fn().mockResolvedValue(new Map()),
    } as unknown as UserPresenceService;

    const service = new ConversationService(
      conversationRepositoryMock,
      {
        findByConversationAndUser: vi.fn().mockResolvedValue(null),
        countUnread: vi.fn().mockResolvedValue(0),
      } as unknown as ConversationParticipantRepository,
      {} as unknown as UserLookupRepository,
      userPresenceServiceMock,
    );

    const conversations = await service.findAllForUser('user-me');

    expect(conversations[0].contact.avatarUrl).toBe(
      `data:image/jpeg;base64,${photoBuffer.toString('base64')}`,
    );
  });
});
