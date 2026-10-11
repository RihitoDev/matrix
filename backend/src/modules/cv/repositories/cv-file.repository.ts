import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
import { mapRecordNotFound } from '../../../common/utils/map-record-not-found.js';
import { ProfileNotFoundException } from '../../profile/exceptions/profile-not-found.exception.js';
import type { FileStorage } from '../../../common/types/file-storage.type.js';

const cvContentSelect = { cvPdfUrl: true } as const;

const userIdSelect = { id: true } as const;

@Injectable()
export class CvFileRepository implements FileStorage {
  constructor(private readonly prisma: PrismaService) {}

  async save(ownerId: string, content: Buffer): Promise<void> {
    await mapRecordNotFound(
      this.prisma.user.update({
        where: { id: ownerId },
        data: { cvPdfUrl: new Uint8Array(content) },
        select: userIdSelect,
      }),
      () => new ProfileNotFoundException(),
    );
  }

  async read(ownerId: string): Promise<Buffer | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: ownerId },
      select: cvContentSelect,
    });

    return user?.cvPdfUrl ? Buffer.from(user.cvPdfUrl) : null;
  }

  async remove(ownerId: string): Promise<void> {
    await mapRecordNotFound(
      this.prisma.user.update({
        where: { id: ownerId },
        data: { cvPdfUrl: null },
        select: userIdSelect,
      }),
      () => new ProfileNotFoundException(),
    );
  }
}
