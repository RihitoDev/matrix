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
    if (currentUserId === contactId) {
      throw new SelfConversationException();
    }

    const contact = await this.userLookupRepository.findById(contactId);
    if (!contact) {
      throw new UserNotFoundException();
    }
    if (!contact.isActive) {
      throw new InactiveUserException();
    }

    const [userAId, userBId] =
      currentUserId < contactId
        ? [currentUserId, contactId]
        : [contactId, currentUserId];

    const existing = await this.conversationRepository.findByOrderedPair(
      userAId,
      userBId,
    );

    if (existing) {
      return this.toResponse(existing, currentUserId);
    }

    const created = await this.conversationRepository.createWithParticipants(
      userAId,
      userBId,
      new Date(),
    );

    return this.toResponse(created, currentUserId);
  }

  async isParticipant(conversationId: string, userId: string): Promise<boolean> {
    const participant =
      await this.participantRepository.findByConversationAndUser(
        conversationId,
        userId,
      );
    return participant !== null;
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

    return {
      id: conversation.id,
      contact: {
        id: contact.id,
        fullName: `${contact.firstName} ${contact.lastName}`.trim(),
        avatarUrl: null,
        isOnline: onlineMap.get(contact.id) ?? false,
      },
      lastMessage: lastMessage
        ? {
            id: lastMessage.id,
            senderId: lastMessage.senderId,
            content: lastMessage.content,
            isAttachment: false,
            attachmentType: null,
            createdAt: lastMessage.sentAt.toISOString(),
          }
        : null,
      unreadCount,
      updatedAt: conversation.updatedAt.toISOString(),
    };
  }
}