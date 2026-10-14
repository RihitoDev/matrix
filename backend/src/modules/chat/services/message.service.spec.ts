import { describe, expect, it, vi } from 'vitest';
import { MessageService } from './message.service.js';
import type { MessageRepository } from '../repositories/message.repository.js';
import type { ConversationRepository } from '../repositories/conversation.repository.js';
import type { ConversationParticipantRepository } from '../repositories/conversation-participant.repository.js';
import type { MessageStatusService } from './message-status.service.js';
import {
  ConversationNotFoundException,
  InvalidMessageContentException,
  NotConversationParticipantException,
} from '../exceptions/index.js';

describe('MessageService', () => {
  const createMockService = () => {
    const messageRepository = {
      create: vi.fn(),
      findPage: vi.fn(),
    } as unknown as MessageRepository;

    const conversationRepository = {
      findById: vi.fn(),
      touchLastMessage: vi.fn(),
    } as unknown as ConversationRepository;

    const participantRepository = {
      findByConversationAndUser: vi.fn(),
      markRead: vi.fn(),
    } as unknown as ConversationParticipantRepository;

    const messageStatusService = {
      getSentId: vi.fn().mockResolvedValue('status-sent-id'),
    } as unknown as MessageStatusService;

    const service = new MessageService(
      messageRepository,
      conversationRepository,
      participantRepository,
      messageStatusService,
    );

    return {
      service,
      messageRepository: messageRepository as unknown as {
        create: ReturnType<typeof vi.fn>;
        findPage: ReturnType<typeof vi.fn>;
      },
      conversationRepository: conversationRepository as unknown as {
        findById: ReturnType<typeof vi.fn>;
        touchLastMessage: ReturnType<typeof vi.fn>;
      },
      participantRepository: participantRepository as unknown as {
        findByConversationAndUser: ReturnType<typeof vi.fn>;
        markRead: ReturnType<typeof vi.fn>;
      },
      messageStatusService: messageStatusService as unknown as {
        getSentId: ReturnType<typeof vi.fn>;
      },
    };
  };

  describe('send', () => {
    it('throws ConversationNotFoundException if conversation does not exist', async () => {
      const { service, conversationRepository } = createMockService();
      conversationRepository.findById.mockResolvedValue(null);

      await expect(
        service.send({
          conversationId: 'conv-none',
          senderId: 'user-1',
          content: 'Hola',
        }),
      ).rejects.toThrow(ConversationNotFoundException);
    });

    it('throws NotConversationParticipantException if user is not a participant', async () => {
      const { service, conversationRepository, participantRepository } =
        createMockService();
      conversationRepository.findById.mockResolvedValue({ id: 'conv-1' });
      participantRepository.findByConversationAndUser.mockResolvedValue(null);

      await expect(
        service.send({
          conversationId: 'conv-1',
          senderId: 'user-intruder',
          content: 'Hola',
        }),
      ).rejects.toThrow(NotConversationParticipantException);
    });

    it('throws InvalidMessageContentException if content is empty or whitespace', async () => {
      const { service, conversationRepository, participantRepository } =
        createMockService();
      conversationRepository.findById.mockResolvedValue({ id: 'conv-1' });
      participantRepository.findByConversationAndUser.mockResolvedValue({
        id: 'part-1',
      });

      await expect(
        service.send({
          conversationId: 'conv-1',
          senderId: 'user-1',
          content: '   ',
        }),
      ).rejects.toThrow(InvalidMessageContentException);
    });

    it('throws InvalidMessageContentException if content exceeds 500 characters', async () => {
      const { service, conversationRepository, participantRepository } =
        createMockService();
      conversationRepository.findById.mockResolvedValue({ id: 'conv-1' });
      participantRepository.findByConversationAndUser.mockResolvedValue({
        id: 'part-1',
      });

      await expect(
        service.send({
          conversationId: 'conv-1',
          senderId: 'user-1',
          content: 'a'.repeat(501),
        }),
      ).rejects.toThrow(InvalidMessageContentException);
    });

    it('creates message, touches lastMessage, marks conversation read and returns response', async () => {
      const {
        service,
        conversationRepository,
        participantRepository,
        messageRepository,
      } = createMockService();

      conversationRepository.findById.mockResolvedValue({ id: 'conv-1' });
      participantRepository.findByConversationAndUser.mockResolvedValue({
        id: 'part-1',
      });

      const now = new Date('2026-10-14T10:00:00.000Z');
      messageRepository.create.mockResolvedValue({
        id: 'msg-123',
        conversationId: 'conv-1',
        senderId: 'user-1',
        content: 'Hola mundo real',
        statusId: 'status-sent-id',
        sentAt: now,
        createdAt: now,
      });

      const result = await service.send({
        conversationId: 'conv-1',
        senderId: 'user-1',
        content: '  Hola mundo real  ',
      });

      expect(messageRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          conversationId: 'conv-1',
          senderId: 'user-1',
          content: 'Hola mundo real',
          statusId: 'status-sent-id',
        }),
      );

      expect(conversationRepository.touchLastMessage).toHaveBeenCalledWith(
        'conv-1',
        'msg-123',
        expect.any(Date),
      );

      expect(participantRepository.markRead).toHaveBeenCalledWith(
        'conv-1',
        'user-1',
        expect.any(Date),
      );

      expect(result).toEqual({
        id: 'msg-123',
        conversationId: 'conv-1',
        senderId: 'user-1',
        content: 'Hola mundo real',
        timestamp: now.toISOString(),
        createdAt: now.toISOString(),
        status: 'sent',
        isAttachment: false,
        attachmentType: null,
      });
    });
  });

  describe('markRead', () => {
    it('throws NotConversationParticipantException if user is not participant', async () => {
      const { service, participantRepository } = createMockService();
      participantRepository.findByConversationAndUser.mockResolvedValue(null);

      await expect(
        service.markRead('conv-1', 'user-intruder'),
      ).rejects.toThrow(NotConversationParticipantException);
    });

    it('marks conversation as read for participant', async () => {
      const { service, participantRepository } = createMockService();
      participantRepository.findByConversationAndUser.mockResolvedValue({
        id: 'part-1',
      });

      await service.markRead('conv-1', 'user-1');

      expect(participantRepository.markRead).toHaveBeenCalledWith(
        'conv-1',
        'user-1',
        expect.any(Date),
      );
    });
  });

  describe('getPage', () => {
    it('throws NotConversationParticipantException if user is not participant', async () => {
      const { service, participantRepository } = createMockService();
      participantRepository.findByConversationAndUser.mockResolvedValue(null);

      await expect(
        service.getPage({
          conversationId: 'conv-1',
          userId: 'user-intruder',
          cursor: null,
          limit: 10,
        }),
      ).rejects.toThrow(NotConversationParticipantException);
    });

    it('returns formatted page of messages', async () => {
      const { service, participantRepository, messageRepository } =
        createMockService();
      participantRepository.findByConversationAndUser.mockResolvedValue({
        id: 'part-1',
      });

      const now = new Date('2026-10-14T10:00:00.000Z');
      messageRepository.findPage.mockResolvedValue({
        data: [
          {
            id: 'm1',
            conversationId: 'conv-1',
            senderId: 'user-1',
            content: 'Hello',
            sentAt: now,
            createdAt: now,
          },
        ],
        hasMore: false,
        nextCursor: null,
      });

      const result = await service.getPage({
        conversationId: 'conv-1',
        userId: 'user-1',
        cursor: null,
        limit: 10,
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('m1');
      expect(result.hasMore).toBe(false);
      expect(result.nextCursor).toBeNull();
    });
  });
});

