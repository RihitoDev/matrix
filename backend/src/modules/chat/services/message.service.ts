import { Injectable } from '@nestjs/common';
import { MessageRepository } from '../repositories/message.repository.js';
import { ConversationRepository } from '../repositories/conversation.repository.js';
import { ConversationParticipantRepository } from '../repositories/conversation-participant.repository.js';
import { MessageStatusService } from './message-status.service.js';
import {
  ConversationNotFoundException,
  InvalidMessageContentException,
  NotConversationParticipantException,
} from '../exceptions/index.js';
import { MAX_MESSAGE_LENGTH } from '../constants/chat.constants.js';
import type { MessageResponse } from '../responses/message.response.js';

@Injectable()
export class MessageService {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly conversationRepository: ConversationRepository,
    private readonly participantRepository: ConversationParticipantRepository,
    private readonly messageStatusService: MessageStatusService,
  ) {}

  async send(params: {
    conversationId: string;
    senderId: string;
    content: string;
  }): Promise<MessageResponse> {
    const conversation = await this.conversationRepository.findById(
      params.conversationId,
    );
    if (!conversation) {
      throw new ConversationNotFoundException();
    }

    const participant =
      await this.participantRepository.findByConversationAndUser(
        params.conversationId,
        params.senderId,
      );
    if (!participant) {
      throw new NotConversationParticipantException();
    }

    const content = this.sanitize(params.content);
    if (content.length === 0) {
      throw new InvalidMessageContentException(
        'El contenido del mensaje no puede estar vacío',
      );
    }
    if (content.length > MAX_MESSAGE_LENGTH) {
      throw new InvalidMessageContentException(
        `El contenido del mensaje no puede superar los ${MAX_MESSAGE_LENGTH} caracteres`,
      );
    }

    const sentStatusId = await this.messageStatusService.getSentId();
    const now = new Date();

    const created = await this.messageRepository.create({
      conversationId: params.conversationId,
      senderId: params.senderId,
      content,
      statusId: sentStatusId,
      sentAt: now,
    });

    await this.conversationRepository.touchLastMessage(
      params.conversationId,
      created.id,
      now,
    );

    await this.participantRepository.markRead(
      params.conversationId,
      params.senderId,
      now,
    );

    return {
      id: created.id,
      conversationId: created.conversationId,
      senderId: created.senderId,
      content: created.content,
      timestamp: created.sentAt.toISOString(),
      createdAt: created.createdAt.toISOString(),
      status: 'sent',
      isAttachment: false,
      attachmentType: null,
    };
  }

  async getPage(params: {
    conversationId: string;
    userId: string;
    cursor: string | null;
    limit: number;
  }) {
    const participant =
      await this.participantRepository.findByConversationAndUser(
        params.conversationId,
        params.userId,
      );
    if (!participant) {
      throw new NotConversationParticipantException();
    }

    const page = await this.messageRepository.findPage({
      conversationId: params.conversationId,
      cursor: params.cursor,
      limit: params.limit,
    });

    return {
      data: page.data.map((m) => ({
        id: m.id,
        conversationId: m.conversationId,
        senderId: m.senderId,
        content: m.content,
        timestamp: m.sentAt.toISOString(),
        createdAt: m.createdAt.toISOString(),
        status: 'sent' as const,
        isAttachment: false,
        attachmentType: null,
      })),
      hasMore: page.hasMore,
      nextCursor: page.nextCursor,
    };
  }

  async markRead(conversationId: string, userId: string): Promise<void> {
    const participant =
      await this.participantRepository.findByConversationAndUser(
        conversationId,
        userId,
      );
    if (!participant) {
      throw new NotConversationParticipantException();
    }

    await this.participantRepository.markRead(
      conversationId,
      userId,
      new Date(),
    );
  }

  private sanitize(raw: string): string {
    return raw
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
      .trim();
  }
}