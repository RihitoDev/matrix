import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
import { ACCESS_REQUEST_STATUS } from '../../access-requests/types/access-request.enum.js';
import {
  toAccessRequestReportUser,
  toRegisteredReportUser,
} from '../mappers/report-user-record.mapper.js';
import type { ReportUser } from '../types/report-user.types.js';

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

    const approvedRequests = requests.filter(
      ({ status }) => status.title === ACCESS_REQUEST_STATUS.APPROVED,
    );

    const approvedByEmail = new Map(
      approvedRequests.map((request) => [request.email.toLowerCase(), request]),
    );

    const registeredUsers = users.map((user) =>
      toRegisteredReportUser(
        user,
        approvedByEmail.get(user.email.toLowerCase()),
      ),
    );

    const seenEmails = new Set(users.map((user) => user.email.toLowerCase()));
    const approvedRequestsNotInUsers = approvedRequests.filter((request) => {
      const email = request.email.toLowerCase();
      if (seenEmails.has(email)) return false;
      seenEmails.add(email);
      return true;
    });

    const registered = [
      ...registeredUsers,
      ...approvedRequestsNotInUsers.map((request) =>
        toAccessRequestReportUser(request, 'APPROVED'),
      ),
    ];

    const rejected = requests
      .filter(({ status }) => status.title === ACCESS_REQUEST_STATUS.REJECTED)
      .map((request) => toAccessRequestReportUser(request, 'REJECTED'));

    return [...registered, ...rejected];
  }
}
