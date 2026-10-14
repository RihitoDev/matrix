import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service.js';

@Injectable()
export class ConversationParticipantRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByConversationAndUser(conversationId: string, userId: string) {
    return this.prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: { conversationId, userId },
      },
    });
  }

  async markRead(conversationId: string, userId: string, readAt: Date) {
    return this.prisma.conversationParticipant.updateMany({
      where: { conversationId, userId },
      data: { lastReadAt: readAt },
    });
  }

  async countUnread(
    conversationId: string,
    userId: string,
    lastReadAt: Date,
  ): Promise<number> {
    return this.prisma.message.count({
      where: {
        conversationId,
        senderId: { not: userId },
        sentAt: { gt: lastReadAt },
      },
    });
  }
}