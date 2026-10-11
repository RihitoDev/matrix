import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
import { mapRecordNotFound } from '../../../common/utils/map-record-not-found.js';
import { CertificationNotFoundException } from '../exceptions/certification-not-found.exception.js';
import type { CreateCertificationRequest } from '../requests/create-certification.request.js';
import type { UpdateCertificationRequest } from '../requests/update-certification.request.js';
import type { CertificationRecord } from '../types/certification-record.type.js';

const certificationSelect = {
  id: true,
  userId: true,
  name: true,
  issuingOrganization: true,
  issueDate: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class CertificationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findManyByUserId(userId: string): Promise<CertificationRecord[]> {
    return this.prisma.certification.findMany({
      where: { userId },
      orderBy: { issueDate: 'desc' },
      select: certificationSelect,
    });
  }

  findById(id: string): Promise<CertificationRecord | null> {
    return this.prisma.certification.findUnique({
      where: { id },
      select: certificationSelect,
    });
  }

  create(
    userId: string,
    data: CreateCertificationRequest,
  ): Promise<CertificationRecord> {
    return this.prisma.certification.create({
      data: { ...data, userId },
      select: certificationSelect,
    });
  }

  update(
    id: string,
    data: UpdateCertificationRequest,
  ): Promise<CertificationRecord> {
    return mapRecordNotFound(
      this.prisma.certification.update({
        where: { id },
        data,
        select: certificationSelect,
      }),
      () => new CertificationNotFoundException(),
    );
  }

  async delete(id: string): Promise<void> {
    await mapRecordNotFound(
      this.prisma.certification.delete({ where: { id } }),
      () => new CertificationNotFoundException(),
    );
  }
}
