import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
import { mapRecordNotFound } from '../../../common/utils/map-record-not-found.js';
import { ProfileNotFoundException } from '../../profile/exceptions/profile-not-found.exception.js';
import type { FileStorage } from '../../../common/types/file-storage.type.js';

const cvContentSelect = { cvPdfData: true } as const;

const cvIdSelect = { id: true } as const;

@Injectable()
export class CvFileRepository implements FileStorage {
  constructor(private readonly prisma: PrismaService) {}

  async save(ownerId: string, content: Buffer, fileName?: string): Promise<void> {
    const data = {
      cvFileName: fileName ?? null,
      cvUploadedAt: new Date(),
      cvPdfData: content.toString('base64'),
    };

    await this.prisma.userCvFile.upsert({
      where: { userId: ownerId },
      create: { userId: ownerId, ...data },
      update: data,
      select: cvIdSelect,
    });
  }

  async read(ownerId: string): Promise<Buffer | null> {
    const cv = await this.prisma.userCvFile.findUnique({
      where: { userId: ownerId },
      select: cvContentSelect,
    });

    return cv?.cvPdfData ? Buffer.from(cv.cvPdfData, 'base64') : null;
  }

  async remove(ownerId: string): Promise<void> {
    await mapRecordNotFound(
      this.prisma.userCvFile.delete({
        where: { userId: ownerId },
        select: cvIdSelect,
      }),
      () => new ProfileNotFoundException(),
    );
  }
}
