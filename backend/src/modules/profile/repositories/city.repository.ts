import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
import type { ProfileCityRecord } from '../types/profile-city-record.type.js';

const citySelect = { id: true, title: true } as const;

@Injectable()
export class CityRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<ProfileCityRecord[]> {
    return this.prisma.city.findMany({
      orderBy: { title: 'asc' },
      select: citySelect,
    });
  }

  async exists(id: string): Promise<boolean> {
    const city = await this.prisma.city.findUnique({
      where: { id },
      select: { id: true },
    });
    return city !== null;
  }
}
