import { CONFIRMED_REGISTRATION_TITLE } from '../constants/event-registrations.constants.js';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service.js';

@Injectable()
export class EventRegistrationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByUserId(userId: string) {
    return this.prisma.eventRegistration.findMany({
      where: {
        userId,
        cancelledAt: null,
        status: { title: CONFIRMED_REGISTRATION_TITLE },
      },
      select: {
        id: true,
        status: { select: { title: true } },
        event: {
          select: {
            title: true,
            eventDate: true,
            startTime: true,
            endTime: true,
            location: true,
          },
        },
      },
      orderBy: { event: { eventDate: 'asc' } },
    });
  }
}
