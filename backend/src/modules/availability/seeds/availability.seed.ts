import { addWeeks, getWeekRange, toBoliviaTime } from '../../../common/utils/date-time.js';
import type { AppointmentStatus, Prisma } from '../../../prisma/client.js';
import {
  BUSY_WEEK_BLOCKS,
  BUSY_WEEK_BLOCKS_PER_DAY,
  CONFIRMED_APPOINTMENT_MESSAGE,
  EARLY_MONDAY_WARNING,
  FALLBACK_TRIO_HOUR,
  MS_PER_DAY,
  MS_PER_MINUTE,
  PENDING_APPOINTMENT_MESSAGE,
  STEP_MS,
  TRIO_NEXT_WEEK_WARNING,
} from '../constants/seed-availability.constants.js';
import { AppointmentStatusTitle } from '../enums/appointment-status-title.enum.js';
import { BLOCK_MAX_HOUR, BLOCK_MIN_HOUR, BLOCK_STEP_MINUTES } from '../constants/create-block.constants.js';
import type { AvailabilitySeedResult } from '../types/availability-seed-result.types.js';
import type { AvailabilitySeedUsers } from '../types/availability-seed-users.types.js';
import type { SeedBlockPlan } from '../types/seed-block-plan.types.js';
import type { SeedBlock } from '../types/seed-block.types.js';
import type { SeedTrioPosition } from '../types/seed-trio-position.types.js';
import type { SeedWeekRange } from '../types/seed-week-range.types.js';
import type { SeedWeeks } from '../types/seed-weeks.types.js';

const weekOf = (reference: Date): SeedWeekRange => {
  const range = getWeekRange(reference);
  return { start: new Date(range.startAt), end: new Date(addWeeks(range.startAt, 1)) };
};

export function getWeeks(now: Date = new Date()): SeedWeeks {
  const current = weekOf(now);
  return {
    previous: weekOf(new Date(current.start.getTime() - 7 * MS_PER_DAY)),
    current,
    next: weekOf(new Date(current.start.getTime() + 7 * MS_PER_DAY)),
  };
}

const minutesAt = (hour: number, minute = 0): number => hour * 60 + minute;

const instantAt = (week: SeedWeekRange, day: number, minutesOfDay: number): Date =>
  new Date(week.start.getTime() + day * MS_PER_DAY + minutesOfDay * MS_PER_MINUTE);

const blockAt = (week: SeedWeekRange, day: number, minutesOfDay: number): SeedBlock => {
  const start = instantAt(week, day, minutesOfDay);
  return { start, end: new Date(start.getTime() + STEP_MS) };
};

export function pastBlockRange(week: SeedWeekRange, now: Date): SeedBlock | null {
  const mondayOpen = instantAt(week, 0, minutesAt(BLOCK_MIN_HOUR));
  const mondayClose = new Date(mondayOpen.getTime() + 60 * MS_PER_MINUTE);
  if (now.getTime() >= mondayClose.getTime()) {
    return { start: mondayOpen, end: mondayClose };
  }

  const closedSlotEnd = new Date(Math.floor(now.getTime() / STEP_MS) * STEP_MS);
  const closedSlotStart = new Date(closedSlotEnd.getTime() - STEP_MS);
  if (closedSlotStart.getTime() >= mondayOpen.getTime()) {
    return { start: closedSlotStart, end: closedSlotEnd };
  }

  return null;
}

function buildBusyWeekBlocks(week: SeedWeekRange): SeedBlock[] {
  const blocks: SeedBlock[] = [];
  for (let day = 0; day < 7 && blocks.length < BUSY_WEEK_BLOCKS; day += 1) {
    const perDay = day < 6 ? BUSY_WEEK_BLOCKS_PER_DAY : 2;
    for (let slot = 0; slot < perDay && blocks.length < BUSY_WEEK_BLOCKS; slot += 1) {
      blocks.push(blockAt(week, day, minutesAt(BLOCK_MIN_HOUR, slot * BLOCK_STEP_MINUTES)));
    }
  }
  return blocks;
}

function pickTrio(now: Date, weeks: SeedWeeks): SeedTrioPosition {
  const duration = 3 * STEP_MS;
  const openMinutes = minutesAt(BLOCK_MIN_HOUR);
  const closeMinutes = BLOCK_MAX_HOUR * 60;
  const future = new Date(Math.ceil((now.getTime() + STEP_MS) / STEP_MS) * STEP_MS);

  if (future.getTime() < weeks.current.end.getTime()) {
    const currentDay = Math.floor((future.getTime() - weeks.current.start.getTime()) / MS_PER_DAY);
    for (let day = currentDay; day < 7; day += 1) {
      const dayOpen = instantAt(weeks.current, day, openMinutes);
      const start = new Date(Math.max(future.getTime(), dayOpen.getTime()));
      const { hours, minutes } = toBoliviaTime(start);
      const minutesOfDay = hours * 60 + minutes;
      const fits =
        minutesOfDay + duration / MS_PER_MINUTE <= closeMinutes &&
        start.getTime() + duration <= weeks.current.end.getTime();
      if (fits) {
        return { start, week: weeks.current };
      }
    }
  }

  return { start: instantAt(weeks.next, 0, minutesAt(FALLBACK_TRIO_HOUR)), week: weeks.next };
}

export function buildBlockPlan(weeks: SeedWeeks, now: Date = new Date()): SeedBlockPlan {
  const warnings: string[] = [];

  const previousWeekBlocks = [
    blockAt(weeks.previous, 1, minutesAt(BLOCK_MIN_HOUR)),
    blockAt(weeks.previous, 1, minutesAt(BLOCK_MIN_HOUR, BLOCK_STEP_MINUTES)),
  ];

  const position = pickTrio(now, weeks);
  const free = { start: position.start, end: new Date(position.start.getTime() + STEP_MS) };
  const pending = {
    start: new Date(free.start.getTime() + STEP_MS),
    end: new Date(free.start.getTime() + 2 * STEP_MS),
  };
  const confirmed = {
    start: new Date(free.start.getTime() + 2 * STEP_MS),
    end: new Date(free.start.getTime() + 3 * STEP_MS),
  };

  const past = pastBlockRange(weeks.current, now);
  if (past === null) {
    warnings.push(EARLY_MONDAY_WARNING);
  }
  if (position.week !== weeks.current) {
    warnings.push(TRIO_NEXT_WEEK_WARNING);
  }

  return {
    blocks: [
      ...previousWeekBlocks,
      ...(past === null ? [] : [past]),
      free,
      pending,
      confirmed,
      ...buildBusyWeekBlocks(weeks.next),
    ],
    free,
    pending,
    confirmed,
    past,
    trioWeek: position.week,
    warnings,
  };
}

async function cleanup(tx: Prisma.TransactionClient, users: AvailabilitySeedUsers): Promise<void> {
  const ids = users.ownedUserIds;
  await tx.appointment.deleteMany({ where: { OR: [{ mentorId: { in: ids } }, { studentId: { in: ids } }] } });
  await tx.availabilityBlock.deleteMany({ where: { mentorId: { in: ids } } });
}

async function seedStatuses(
  tx: Prisma.TransactionClient,
): Promise<{ pending: AppointmentStatus; confirmed: AppointmentStatus }> {
  const ensure = (title: string) =>
    tx.appointmentStatus.upsert({ where: { title }, create: { title }, update: {} });

  return {
    pending: await ensure(AppointmentStatusTitle.PENDING),
    confirmed: await ensure(AppointmentStatusTitle.CONFIRMED),
  };
}

async function seedBlocks(tx: Prisma.TransactionClient, mentorId: string, plan: SeedBlockPlan): Promise<number> {
  const { count } = await tx.availabilityBlock.createMany({
    data: plan.blocks.map((block) => ({ mentorId, startAt: block.start, endAt: block.end })),
  });
  return count;
}

async function seedAppointments(
  tx: Prisma.TransactionClient,
  users: AvailabilitySeedUsers,
  statuses: { pending: AppointmentStatus; confirmed: AppointmentStatus },
  plan: SeedBlockPlan,
): Promise<number> {
  const trioBlocks = await tx.availabilityBlock.findMany({
    where: { mentorId: users.mentorId, startAt: { gte: plan.trioWeek.start, lt: plan.trioWeek.end } },
    select: { id: true, startAt: true },
  });
  const idByStart = new Map(trioBlocks.map((block) => [block.startAt.getTime(), block.id]));

  const pendingBlock = idByStart.get(plan.pending.start.getTime());
  const confirmedBlock = idByStart.get(plan.confirmed.start.getTime());
  if (!pendingBlock || !confirmedBlock) {
    throw new Error('No se encontraron los bloques de prueba para crear las citas de la semana del trío.');
  }

  const buildAppointment = (block: SeedBlock, blockId: string, statusId: string, message: string) => ({
    blockId,
    mentorId: users.mentorId,
    studentId: users.graduateId,
    startAt: block.start,
    endAt: block.end,
    statusId,
    message,
  });

  const { count } = await tx.appointment.createMany({
    data: [
      buildAppointment(plan.pending, pendingBlock, statuses.pending.id, PENDING_APPOINTMENT_MESSAGE),
      buildAppointment(plan.confirmed, confirmedBlock, statuses.confirmed.id, CONFIRMED_APPOINTMENT_MESSAGE),
    ],
  });
  return count;
}

export async function seedAvailability(
  tx: Prisma.TransactionClient,
  users: AvailabilitySeedUsers,
  now: Date = new Date(),
): Promise<AvailabilitySeedResult> {
  const weeks = getWeeks(now);
  const plan = buildBlockPlan(weeks, now);

  await cleanup(tx, users);
  const statuses = await seedStatuses(tx);
  const blocks = await seedBlocks(tx, users.mentorId, plan);
  const appointments = await seedAppointments(tx, users, statuses, plan);

  return {
    weeks,
    plan,
    statuses: Object.keys(statuses).length,
    blocks,
    appointments,
    warnings: plan.warnings,
  };
}
