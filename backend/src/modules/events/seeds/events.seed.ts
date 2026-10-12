import type { Prisma } from '../../../prisma/client.js';
import {
  SEED_EVENTS,
  SEED_CATEGORY_NAMES,
} from '../constants/seed-events.constants.js';
export async function seedEvents(
  tx: Prisma.TransactionClient,
  createdById: string,
): Promise<void> {
  const categories = [];
  for (const name of SEED_CATEGORY_NAMES) {
    categories.push(
      await tx.eventCategory.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    );
  }
  const modality = await tx.eventModality.upsert({
    where: { title: 'Presencial' },
    update: {},
    create: { id: '22222222-2222-2222-2222-222222222222', title: 'Presencial' },
  });
  const origin = await tx.eventOrigin.upsert({
    where: { title: 'Institucional' },
    update: {},
    create: {
      id: '22222222-2222-2222-2222-222222222223',
      title: 'Institucional',
    },
  });
  const eventStatus = await tx.eventStatus.upsert({
    where: { title: 'Publicado' },
    update: {},
    create: { id: '22222222-2222-2222-2222-222222222224', title: 'Publicado' },
  });
  for (const e of SEED_EVENTS) {
    await tx.event.upsert({
      where: { id: e.id },
      update: {
        capacity: e.capacity,
        categoryId: categories[e.categoryIndex].id,
      },
      create: {
        id: e.id,
        title: e.title,
        description: 'Evento de prueba',
        instructorName: 'Instructor Demo',
        eventDate: new Date(e.date),
        startTime: new Date('1970-01-01T09:00:00.000Z'),
        endTime: new Date('1970-01-01T12:00:00.000Z'),
        location: e.location,
        capacity: e.capacity,
        supportThreshold: 0,
        categoryId: categories[e.categoryIndex].id,
        modalityId: modality.id,
        originId: origin.id,
        statusId: eventStatus.id,
        createdById: createdById,
      },
    });
  }
}
