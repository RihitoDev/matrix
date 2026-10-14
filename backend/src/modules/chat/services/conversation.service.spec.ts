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
});
