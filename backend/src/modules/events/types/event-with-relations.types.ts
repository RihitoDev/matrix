import type { Prisma } from '../../../prisma/client.js';

export type EventWithRelations = Prisma.EventGetPayload<{
  select: {
    id: true;
    title: true;
    description: true;
    eventDate: true;
    startTime: true;
    endTime: true;
    location: true;
    capacity: true;
    statusId: true;
    instructorName: true;
    modalityId: true;
    category: {
      select: {
        id: true;
        name: true;
      };
    };
    _count: {
      select: {
        registrations: true;
      };
    };
  };
}>;
