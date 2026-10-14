import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class SessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  findActiveUserById(id: string) {
    return this.prisma.user.findFirst({
      where: { id, isActive: true },
      select: {
        id: true,
        email: true,
        roles: {
          where: { deletedAt: null, startAt: { lte: new Date() } },
          select: { role: { select: { name: true } } },
        },
      },
    });
  }
}
