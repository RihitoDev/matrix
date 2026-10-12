import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
import { mapRecordNotFound } from '../../../common/utils/map-record-not-found.js';
import { CertificationNotFoundException } from '../../certifications/exceptions/certification-not-found.exception.js';

const documentSelect = { documentUrl: true } as const;

const idSelect = { id: true } as const;

@Injectable()
export class CertificationDocumentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(id: string, content: Buffer): Promise<void> {
    await mapRecordNotFound(
      this.prisma.certification.update({
        where: { id },
        data: { documentUrl: new Uint8Array(content) },
        select: idSelect,
      }),
      () => new CertificationNotFoundException(),
    );
  }

  async read(id: string): Promise<Buffer | null> {
    const record = await this.prisma.certification.findUnique({
      where: { id },
      select: documentSelect,
    });

    return record?.documentUrl ? Buffer.from(record.documentUrl) : null;
  }

  async remove(id: string): Promise<void> {
    await mapRecordNotFound(
      this.prisma.certification.update({
        where: { id },
        data: { documentUrl: null },
        select: idSelect,
      }),
      () => new CertificationNotFoundException(),
    );
  }

  async hasDocument(id: string): Promise<boolean> {
    const record = await this.prisma.certification.findFirst({
      where: { id, documentUrl: { not: null } },
      select: idSelect,
    });

    return record !== null;
  }

  async findIdsWithDocument(userId: string): Promise<Set<string>> {
    const records = await this.prisma.certification.findMany({
      where: { userId, documentUrl: { not: null } },
      select: idSelect,
    });

    return new Set(records.map((record) => record.id));
  }
}
