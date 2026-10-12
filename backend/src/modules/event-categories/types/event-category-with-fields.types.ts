import type { Prisma } from '../../../prisma/client.js';

export type EventCategoryWithFields = Prisma.EventCategoryGetPayload<{
  select: {
    id: true;
    name: true;
  };
}>;
