import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service.js';

@Injectable()
export class UserPresenceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserIds(userIds: string[]) {
    if (userIds.length === 0) return [];
    return this.prisma.userPresence.findMany({
      where: { userId: { in: userIds } },
      select: { userId: true, isOnline: true, lastSeenAt: true },
    });
  }

  async upsert(userId: string, isOnline: boolean, lastSeenAt: Date) {
    return this.prisma.userPresence.upsert({
      where: { userId },
      create: { userId, isOnline, lastSeenAt },
      update: { isOnline, lastSeenAt },
    });
  }
}