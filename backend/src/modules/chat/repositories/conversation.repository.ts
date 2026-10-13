import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service.js';

@Injectable()
export class ConversationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(conversationId: string) {
    return this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });
  }

  async findByOrderedPair(userAId: string, userBId: string) {
    return this.prisma.conversation.findUnique({
      where: { userAId_userBId: { userAId, userBId } },
      include: {
        userA: { select: { id: true, firstName: true, lastName: true } },
        userB: { select: { id: true, firstName: true, lastName: true } },
        messages: {
          orderBy: { sentAt: 'desc' },
          take: 1,
          include: { status: { select: { title: true } } },
        },
      },
    });
  }

  async createWithParticipants(
    userAId: string,
    userBId: string,
    lastReadAt: Date,
  ) {
    return this.prisma.conversation.create({
      data: {
        userAId,
        userBId,
        participants: {
          createMany: {
            data: [
              { userId: userAId, lastReadAt },
              { userId: userBId, lastReadAt },
            ],
          },
        },
      },
      include: {
        userA: { select: { id: true, firstName: true, lastName: true } },
        userB: { select: { id: true, firstName: true, lastName: true } },
        messages: {
          orderBy: { sentAt: 'desc' },
          take: 1,
          include: { status: { select: { title: true } } },
        },
      },
    });
  }

  async touchLastMessage(
    conversationId: string,
    lastMessageId: string,
    lastMessageAt: Date,
  ) {
    return this.prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageId, lastMessageAt },
    });
  }
}