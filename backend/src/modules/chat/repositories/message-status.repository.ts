import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
import { MessageStatusTitle } from '../constants/chat.constants.js';

@Injectable()
export class MessageStatusRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByTitle(title: MessageStatusTitle) {
    return this.prisma.messageStatus.findUnique({
      where: { title },
      select: { id: true, title: true },
    });
  }

  async findAll() {
    return this.prisma.messageStatus.findMany({
      select: { id: true, title: true, description: true },
      orderBy: { title: 'asc' },
    });
  }
}