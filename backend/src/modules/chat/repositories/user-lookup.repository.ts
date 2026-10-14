import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service.js';

@Injectable()
export class UserLookupRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findActiveById(userId: string) {
    return this.prisma.user.findFirst({
      where: { id: userId, isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        headline: true,
      },
    });
  }

  async findById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        isActive: true,
      },
    });
  }

  async searchActiveByName(
    normalizedQuery: string,
    excludeUserId: string,
    limit: number,
  ) {
    const escaped = normalizedQuery.replace(/[%_\\]/g, '\\$&');
    const pattern = `%${escaped}%`;

    return this.prisma.$queryRaw<
      Array<{
        id: string;
        first_name: string;
        last_name: string;
        headline: string | null;
        is_online: boolean | null;
        role_name: string | null;
      }>
    >`
      SELECT
        u.id,
        u.first_name,
        u.last_name,
        u.headline,
        up.is_online,
        r.name AS role_name
      FROM users u
      LEFT JOIN user_presences up ON up.user_id = u.id
      LEFT JOIN user_roles ur ON ur.user_id = u.id AND ur.deleted_at IS NULL
      LEFT JOIN roles r ON r.id = ur.role_id
      WHERE u.id <> ${excludeUserId}::uuid
        AND u.is_active = true
        AND lower(u.first_name || ' ' || u.last_name)
            LIKE lower(${pattern}) ESCAPE '\\'
      ORDER BY u.first_name ASC, u.last_name ASC
      LIMIT ${limit};
    `;
  }
}