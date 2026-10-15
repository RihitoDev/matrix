import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
import type { CvMetadataRecord } from '../types/cv-metadata-record.type.js';

@Injectable()
export class CvMetadataRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<CvMetadataRecord | null> {
    const rows = await this.prisma.$queryRaw<CvMetadataRecord[]>`
      SELECT
        u.first_name AS "firstName",
        u.last_name AS "lastName",
        c.cv_file_name AS "fileName",
        octet_length(decode(c.cv_pdf_data, 'base64')) AS "sizeBytes",
        c.cv_uploaded_at AS "uploadedAt"
      FROM users u
      LEFT JOIN user_cv_file c ON c.user_id = u.id
      WHERE u.id = ${userId}::uuid
    `;

    return rows[0] ?? null;
  }
}
