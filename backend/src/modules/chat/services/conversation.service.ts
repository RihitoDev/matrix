import { Injectable } from '@nestjs/common';
import { ConversationRepository } from '../repositories/conversation.repository.js';
import { ConversationParticipantRepository } from '../repositories/conversation-participant.repository.js';
import { UserLookupRepository } from '../repositories/user-lookup.repository.js';
import { UserPresenceService } from './user-presence.service.js';
import {
  InactiveUserException,
  SelfConversationException,
  UserNotFoundException,
} from '../exceptions/index.js';
import type { ConversationResponse } from '../responses/conversation.response.js';

@Injectable()
export class ConversationService {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly participantRepository: ConversationParticipantRepository,
    private readonly userLookupRepository: UserLookupRepository,
    private readonly userPresenceService: UserPresenceService,
  ) {}

  async getOrCreate(
    currentUserId: string,
    contactId: string,
  ): Promise<ConversationResponse> {
    const { conversation } = await this.getOrCreateWithStatus(
      currentUserId,
      contactId,
    );
    return conversation;
  }

  async getOrCreateWithStatus(
    currentUserId: string,
    contactId: string,
  ): Promise<{ conversation: ConversationResponse; isCreated: boolean }> {
    const normalizedCurrentUserId = currentUserId.trim().toLowerCase();
    const normalizedContactId = contactId.trim().toLowerCase();

    if (normalizedCurrentUserId === normalizedContactId) {
      throw new SelfConversationException();
    }

    const contact = await this.userLookupRepository.findById(normalizedContactId);
    if (!contact) {
      throw new UserNotFoundException();
    }
    if (!contact.isActive) {
      throw new InactiveUserException();
    }

    const [userAId, userBId] =
      normalizedCurrentUserId < normalizedContactId
        ? [normalizedCurrentUserId, normalizedContactId]
        : [normalizedContactId, normalizedCurrentUserId];

    const existing = await this.conversationRepository.findByOrderedPair(
      userAId,
      userBId,
    );

    if (existing) {
      const conversation = await this.toResponse(existing, normalizedCurrentUserId);
      return { conversation, isCreated: false };
    }

    try {
      const created = await this.conversationRepository.createWithParticipants(
        userAId,
        userBId,
        new Date(),
      );

      const conversation = await this.toResponse(created, normalizedCurrentUserId);
      return { conversation, isCreated: true };
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      if (
        err?.code === 'P2002' ||
        err?.message?.includes('P2002') ||
        err?.message?.includes('Unique constraint')
      ) {
        const concurrentExisting =
          await this.conversationRepository.findByOrderedPair(
            userAId,
            userBId,
          );
        if (concurrentExisting) {
          const conversation = await this.toResponse(
            concurrentExisting,
            normalizedCurrentUserId,
          );
          return { conversation, isCreated: false };
        }
      }
      throw error;
    }
  }

  async isParticipant(conversationId: string, userId: string): Promise<boolean> {
    const participant =
      await this.participantRepository.findByConversationAndUser(
        conversationId,
        userId,
      );
    return participant !== null;
  }

  async findAllForUser(
    currentUserId: string,
  ): Promise<ConversationResponse[]> {
    const list =
      await this.conversationRepository.findUserConversations(currentUserId);

    return Promise.all(
      list.map((conversation) => this.toResponse(conversation, currentUserId)),
    );
  }

  private async toResponse(
    conversation: {
      id: string;
      userAId: string;
      userBId: string;
      updatedAt: Date;
      userA: { id: string; firstName: string; lastName: string };
      userB: { id: string; firstName: string; lastName: string };
      messages: Array<{
        id: string;
        senderId: string;
        content: string;
        sentAt: Date;
      }>;
    },
    currentUserId: string,
  ): Promise<ConversationResponse> {
    const contact =
      conversation.userAId === currentUserId
        ? conversation.userB
        : conversation.userA;

    const onlineMap = await this.userPresenceService.mapOnlineStatus([
      contact.id,
    ]);

    const participant =
      await this.participantRepository.findByConversationAndUser(
        conversation.id,
        currentUserId,
      );

    const unreadCount = participant
      ? await this.participantRepository.countUnread(
          conversation.id,
          currentUserId,
          participant.lastReadAt,
        )
      : 0;

    const lastMessage = conversation.messages[0];
    const isAttachment = Boolean(
      lastMessage?.content.startsWith('[Archivo] '),
    );
    const content = isAttachment
      ? lastMessage!.content.slice(10)
      : (lastMessage?.content ?? '');
    const attachmentType = isAttachment ? ('file' as const) : null;

    const contactPhoto = (contact as { photoUrl?: Uint8Array | null }).photoUrl;
    const avatarUrl = contactPhoto
      ? `data:image/jpeg;base64,${Buffer.from(contactPhoto).toString('base64')}`
      : null;

    return {
      id: conversation.id,
      contact: {
        id: contact.id,
        fullName: `${contact.firstName} ${contact.lastName}`.trim(),
        avatarUrl,
        isOnline: onlineMap.get(contact.id) ?? false,
      },
      lastMessage: lastMessage
        ? {
            id: lastMessage.id,
            senderId: lastMessage.senderId,
            content,
            isAttachment,
            attachmentType,
            createdAt: lastMessage.sentAt.toISOString(),
          }
        : null,
      unreadCount,
      updatedAt: conversation.updatedAt.toISOString(),
    };
  }
}