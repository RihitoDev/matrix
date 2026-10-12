import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
import { escapePgWildcards } from '../../../common/utils/escape-pg-wildcards.js';
import type { Prisma } from '../../../prisma/client.js';
import type {
  FindEventCategoriesPayload,
  FindEventCategoriesResponse,
  EventCategoryWithFields,
} from '../types/event-categories.types.js';

@Injectable()
export class EventCategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAndCount(
    payload: FindEventCategoriesPayload,
  ): Promise<FindEventCategoriesResponse> {
    const { search, skip, take } = payload;

    const where: Prisma.EventCategoryWhereInput = {
      ...(search !== undefined && {
        name: {
          contains: escapePgWildcards(search),
          mode: 'insensitive',
        },
      }),
    };

    const select = {
      id: true,
      name: true,
    } as const;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.eventCategory.findMany({
        select,
        where,
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
        skip,
        take,
      }),
      this.prisma.eventCategory.count({ where }),
    ]);

    return {
      items: items as unknown as EventCategoryWithFields[],
      total,
    };
  }
}
