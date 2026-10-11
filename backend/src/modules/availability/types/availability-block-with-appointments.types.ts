import type { Prisma } from '../../../prisma/client.js';
import type { BLOCK_WITH_ACTIVE_APPOINTMENTS_INCLUDE } from '../constants/block-query.constants.js';

export type AvailabilityBlockWithAppointments = Prisma.AvailabilityBlockGetPayload<{
  include: typeof BLOCK_WITH_ACTIVE_APPOINTMENTS_INCLUDE;
}>;
