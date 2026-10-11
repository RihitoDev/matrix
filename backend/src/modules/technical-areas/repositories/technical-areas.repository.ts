import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service.js';

@Injectable()
export class TechnicalAreasRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.technicalArea.findMany({
      select: {
        id: true,
        name: true,
        description: true,
      },
      orderBy: { name: 'asc' },
    });
  }
}
