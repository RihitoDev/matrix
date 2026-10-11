import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
import { mapRecordNotFound } from '../../../common/utils/map-record-not-found.js';
import { ProfileNotFoundException } from '../exceptions/profile-not-found.exception.js';
import type { UpdatePersonalInfoRequest } from '../requests/update-personal-info.request.js';
import type { UpdatePresentationRequest } from '../requests/update-presentation.request.js';
import type { ProfileRecord } from '../types/profile-record.type.js';

const profileSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  personalEmail: true,
  phone: true,
  headline: true,
  aboutMe: true,
  updatedAt: true,
  city: { select: { id: true, title: true } },
} as const;

@Injectable()
export class ProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByUserId(userId: string): Promise<ProfileRecord | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: profileSelect,
    });
  }

  update(
    userId: string,
    data: UpdatePersonalInfoRequest | UpdatePresentationRequest,
  ): Promise<ProfileRecord> {
    return mapRecordNotFound(
      this.prisma.user.update({
        where: { id: userId },
        data,
        select: profileSelect,
      }),
      () => new ProfileNotFoundException(),
    );
  }
}
