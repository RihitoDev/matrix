import type { Prisma } from '../../../prisma/client.js';
import { SEED_EVENTS } from '../../events/constants/seed-events.constants.js';
import { CONFIRMED_REGISTRATION_TITLE } from '../constants/event-registrations.constants.js';
export async function seedEventRegistrations(
  tx: Prisma.TransactionClient,
  userId: string,
): Promise<void> {
  const regStatus = await tx.registrationStatus.upsert({
    where: { title: CONFIRMED_REGISTRATION_TITLE },
    update: {},
    create: {
      id: '22222222-2222-2222-2222-222222222225',
      title: CONFIRMED_REGISTRATION_TITLE,
    },
  });
  for (const e of SEED_EVENTS) {
    if (e.enroll) {
      await tx.eventRegistration.upsert({
        where: { eventId_userId: { eventId: e.id, userId: userId } },
        update: {},
        create: {
          eventId: e.id,
          userId: userId,
          statusId: regStatus.id,
          qrToken: `qr-seed-${e.id.slice(-4)}`,
        },
      });
    }
  }
}
