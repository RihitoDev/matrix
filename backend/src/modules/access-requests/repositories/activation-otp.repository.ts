import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service.js';

@Injectable()
export class ActivationOtpRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Solo se guarda el hash del código, nunca el texto plano
  create(data: { accessRequestId: string; codeHash: string; expiresAt: Date }) {
    return this.prisma.activationOtp.create({ data, select: { id: true, expiresAt: true } });
  }
}
