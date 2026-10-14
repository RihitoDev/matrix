
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ChatRepository } from '../repositories/chat.repository.js';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class ChatService {
  constructor(private readonly chatRepository: ChatRepository) {}

  async getMessages(
    conversationId: string,
    userId: string,
    limit = 10,
    cursor?: string,
  ) {
    if (!UUID_PATTERN.test(conversationId)) {
      throw new BadRequestException('ID de conversación inválido');
    }

    if (cursor && !UUID_PATTERN.test(cursor)) {
      throw new BadRequestException('Cursor inválido');
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
      throw new BadRequestException('El límite debe estar entre 1 y 50');
    }

    const conversation = await this.chatRepository.findConversation(
      conversationId,
      userId,
    );

    if (!conversation) {
      throw new ForbiddenException(
        'La conversación no existe o no tienes acceso',
      );
    }

    if (cursor) {
  const cursorMessage =
    await this.chatRepository.findMessageCursor(
      conversationId,
      cursor,
    );

  if (!cursorMessage) {
    throw new BadRequestException(
      'El cursor no pertenece a esta conversación o no existe',
    );
  }
}

    const messages = await this.chatRepository.findMessages(
      conversationId,
      limit,
      cursor,
    );

    const hasMore = messages.length > limit;
    const page = messages.slice(0, limit);
    const nextCursor = hasMore
      ? page[page.length - 1]?.id ?? null
      : null;

    return {
      data: page.reverse().map((message) => ({
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        content: message.content,
        createdAt: message.sentAt.toISOString(),
      })),
      nextCursor,
      hasMore,
    };
  }
}
