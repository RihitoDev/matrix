import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service.js';

@Injectable()
export class OrientationTypesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findActive() {
    return this.prisma.orientationType.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }
}
