import type { Prisma } from '../../../prisma/client.js';
import { ACTIVE_APPOINTMENT_STATUSES } from './appointment-status.constants.js';

export const BLOCK_WITH_ACTIVE_APPOINTMENTS_INCLUDE = {
  appointments: {
    where: { status: { title: { in: ACTIVE_APPOINTMENT_STATUSES } } },
    select: { status: { select: { title: true } } },
  },
} satisfies Prisma.AvailabilityBlockInclude;

export const WITHOUT_ACTIVE_APPOINTMENTS_WHERE = {
  appointments: { none: { status: { title: { in: ACTIVE_APPOINTMENT_STATUSES } } } },
} satisfies Prisma.AvailabilityBlockWhereInput;
