import { Injectable } from '@nestjs/common';
import { ROLE_NAMES, type RoleName } from '../../../common/enums/roles.enum.js';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
import { ACCESS_REQUEST_STATUS } from '../../access-requests/types/access-request.enum.js';
import type {
  ReportDocumentType,
  ReportUser,
} from '../types/report-user.types.js';

const DEFAULT_USER_TYPE: RoleName = 'titulado';

function toRoleName(name: string | undefined): RoleName {
  const normalized = name?.toLowerCase().trim();
  return ROLE_NAMES.find((role) => role === normalized) ?? DEFAULT_USER_TYPE;
}

function toFullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

@Injectable()
export class ReportUsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ReportUser[]> {
    const [users, requests] = await Promise.all([
      this.prisma.user.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          createdAt: true,
          roles: {
            select: { role: { select: { name: true } } },
            where: { deletedAt: null },
            orderBy: { startAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.accessRequest.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          idCardNumber: true,
          rejectionReason: true,
          submittedAt: true,
          createdAt: true,
          status: { select: { title: true } },
          documentType: { select: { title: true } },
        },
        where: {
          status: {
            title: {
              in: [
                ACCESS_REQUEST_STATUS.APPROVED,
                ACCESS_REQUEST_STATUS.REJECTED,
              ],
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const approvedByEmail = new Map(
      requests
        .filter(({ status }) => status.title === ACCESS_REQUEST_STATUS.APPROVED)
        .map((request) => [request.email.toLowerCase(), request]),
    );

    const registered = users.map((user): ReportUser => {
      const request = approvedByEmail.get(user.email.toLowerCase());

      return {
        id: user.id,
        fullName: toFullName(user.firstName, user.lastName),
        email: user.email,
        userType: toRoleName(user.roles[0]?.role.name),
        identifier: request?.idCardNumber ?? '',
        documentType:
          (request?.documentType?.title as ReportDocumentType | undefined) ??
          null,
        registeredAt: user.createdAt.toISOString(),
        registrationStatus: 'APPROVED',
        rejectionReason: null,
      };
    });

    const rejected = requests
      .filter(({ status }) => status.title === ACCESS_REQUEST_STATUS.REJECTED)
      .map((request): ReportUser => ({
        id: request.id,
        fullName: toFullName(request.firstName, request.lastName),
        email: request.email,
        userType: DEFAULT_USER_TYPE,
        identifier: request.idCardNumber,
        documentType:
          (request.documentType?.title as ReportDocumentType | undefined) ??
          null,
        registeredAt: (request.submittedAt ?? request.createdAt).toISOString(),
        registrationStatus: 'REJECTED',
        rejectionReason: request.rejectionReason,
      }));

    return [...registered, ...rejected];
  }
}
