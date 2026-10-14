
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service.js';

@Injectable()
export class ChatRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findConversation(
    conversationId: string,
    userId: string,
  ) {
    return this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          { userAId: userId },
          { userBId: userId },
        ],
      },
    });
  }

  async findMessages(
    conversationId: string,
    limit: number,
    cursor?: string,
  ) {
    return this.prisma.message.findMany({
      where: {
        conversationId,
      },
      take: limit + 1,
      ...(cursor
        ? {
            skip: 1,
            cursor: { id: cursor },
          }
        : {}),
      orderBy: [
        { sentAt: 'desc' },
        { id: 'desc' },
      ],
    });
  }

async findMessageCursor(
  conversationId: string,
  messageId: string,
) {
  return this.prisma.message.findFirst({
    where: {
      id: messageId,
      conversationId,
    },
    select: {
      id: true,
    },
  });
}

}
