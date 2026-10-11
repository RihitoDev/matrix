import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
import type { CvMetadataRecord } from '../types/cv-metadata-record.type.js';

@Injectable()
export class CvMetadataRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<CvMetadataRecord | null> {
    const rows = await this.prisma.$queryRaw<CvMetadataRecord[]>`
      SELECT
        first_name AS "firstName",
        last_name AS "lastName",
        octet_length(cv_pdf_url) AS "sizeBytes",
        updated_at AS "updatedAt"
      FROM users
      WHERE id = ${userId}::uuid
    `;

    return rows[0] ?? null;
  }
}
