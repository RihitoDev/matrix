import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service.js';

@Injectable()
export class MessageRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    conversationId: string;
    senderId: string;
    content: string;
    statusId: string;
    sentAt: Date;
  }) {
    return this.prisma.message.create({
      data,
      include: { status: { select: { title: true } } },
    });
  }

  async findPage(params: {
    conversationId: string;
    cursor: string | null;
    limit: number;
  }) {
    const { conversationId, cursor, limit } = params;

    const rows = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { sentAt: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = rows.length > limit;
    const data = hasMore ? rows.slice(0, limit) : rows;

    return {
      data,
      hasMore,
      nextCursor: hasMore && data.length > 0 ? data[data.length - 1].id : null,
    };
  }
}