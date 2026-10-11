import { describe, expect, it, vi } from 'vitest';
import { BLOCK_STEP_MINUTES } from '../constants/create-block.constants.js';
import { EARLY_MONDAY_WARNING, TRIO_NEXT_WEEK_WARNING } from '../constants/seed-availability.constants.js';
import { AppointmentStatusTitle } from '../enums/appointment-status-title.enum.js';
import { buildBlockPlan, getWeeks, pastBlockRange, seedAvailability } from '../seeds/availability.seed.js';

const STEP_MS = BLOCK_STEP_MINUTES * 60_000;

// Instantes en UTC (Bolivia es UTC-4)
const MIDWEEK = new Date('2026-10-07T15:00:00Z');
const EARLY_MONDAY = new Date('2026-10-05T04:00:00Z');
const MONDAY_MORNING = new Date('2026-10-05T11:40:00Z');
const SUNDAY_NIGHT = new Date('2026-10-12T02:30:00Z');

describe('getWeeks', () => {
  it('devuelve semanas consecutivas de siete días', () => {
    const weeks = getWeeks(MIDWEEK);
    expect(weeks.current.end.getTime() - weeks.current.start.getTime()).toBe(7 * 86_400_000);
    expect(weeks.previous.end.getTime()).toBe(weeks.current.start.getTime());
    expect(weeks.next.start.getTime()).toBe(weeks.current.end.getTime());
  });

  it('usa la fecha actual si no se pasa ninguna', () => {
    expect(getWeeks().current.start.getTime()).toBeLessThanOrEqual(Date.now());
  });
});

describe('pastBlockRange', () => {
  it('usa la primera hora del lunes si ya pasó', () => {
    const weeks = getWeeks(MIDWEEK);
    const block = pastBlockRange(weeks.current, MIDWEEK);
    expect(block).not.toBeNull();
    expect(block!.end.getTime() - block!.start.getTime()).toBe(60 * 60_000);
  });

  it('usa el último bloque cerrado el mismo lunes', () => {
    const weeks = getWeeks(MONDAY_MORNING);
    const block = pastBlockRange(weeks.current, MONDAY_MORNING);
    expect(block).not.toBeNull();
    expect(block!.end.getTime() - block!.start.getTime()).toBe(STEP_MS);
    expect(block!.end.getTime()).toBeLessThanOrEqual(MONDAY_MORNING.getTime());
  });

  it('devuelve null si es lunes muy temprano', () => {
    const weeks = getWeeks(EARLY_MONDAY);
    expect(pastBlockRange(weeks.current, EARLY_MONDAY)).toBeNull();
  });
});

describe('buildBlockPlan', () => {
  it.each([
    ['entre semana', MIDWEEK],
    ['lunes a media mañana', MONDAY_MORNING],
    ['domingo por la noche', SUNDAY_NIGHT],
  ])('arma el trío libre, pendiente y confirmado consecutivo (%s)', (_name, now) => {
    const plan = buildBlockPlan(getWeeks(now), now);

    expect(plan.pending.start.getTime()).toBe(plan.free.end.getTime());
    expect(plan.confirmed.start.getTime()).toBe(plan.pending.end.getTime());
    expect(plan.blocks).toEqual(expect.arrayContaining([plan.free, plan.pending, plan.confirmed]));
    expect(plan.blocks.length).toBeGreaterThan(50);
  });

  it('avisa si es lunes muy temprano y no hay bloque pasado', () => {
    const plan = buildBlockPlan(getWeeks(EARLY_MONDAY), EARLY_MONDAY);
    expect(plan.past).toBeNull();
    expect(plan.warnings).toContain(EARLY_MONDAY_WARNING);
  });

  it('avisa si el trío pasa a la semana siguiente', () => {
    const plan = buildBlockPlan(getWeeks(SUNDAY_NIGHT), SUNDAY_NIGHT);
    expect(plan.warnings).toContain(TRIO_NEXT_WEEK_WARNING);
    expect(plan.trioWeek.start.getTime()).toBeGreaterThan(getWeeks(SUNDAY_NIGHT).current.start.getTime());
  });

  it('usa la fecha actual por defecto', () => {
    expect(buildBlockPlan(getWeeks()).blocks.length).toBeGreaterThan(0);
  });
});

function buildTx() {
  const created: Array<{ mentorId: string; startAt: Date; endAt: Date }> = [];
  const tx = {
    appointment: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }), createMany: vi.fn().mockResolvedValue({ count: 2 }) },
    availabilityBlock: {
      deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
      createMany: vi.fn().mockImplementation(async ({ data }) => {
        created.push(...data);
        return { count: data.length };
      }),
      findMany: vi.fn().mockImplementation(async () => created.map((block, index) => ({ id: `block-${index}`, startAt: block.startAt }))),
    },
    appointmentStatus: {
      upsert: vi.fn().mockImplementation(async ({ where }) => ({ id: `status-${where.title}`, title: where.title })),
    },
  };
  return { tx, created };
}

const users = { mentorId: 'mentor-1', graduateId: 'grad-1', ownedUserIds: ['mentor-1', 'grad-1'] };

describe('seedAvailability', () => {
  it('limpia lo anterior, crea estados, bloques y dos citas', async () => {
    const { tx, created } = buildTx();

    const result = await seedAvailability(tx as any, users, MIDWEEK);

    expect(tx.appointment.deleteMany).toHaveBeenCalledOnce();
    expect(tx.availabilityBlock.deleteMany).toHaveBeenCalledWith({ where: { mentorId: { in: users.ownedUserIds } } });
    expect(tx.appointmentStatus.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { title: AppointmentStatusTitle.PENDING } }),
    );
    expect(tx.appointmentStatus.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { title: AppointmentStatusTitle.CONFIRMED } }),
    );
    expect(result).toMatchObject({ statuses: 2, blocks: created.length, appointments: 2 });
    const [{ data }] = tx.appointment.createMany.mock.calls[0];
    expect(data).toHaveLength(2);
    expect(data[0]).toMatchObject({ mentorId: 'mentor-1', studentId: 'grad-1' });
  });

  it('usa la fecha actual por defecto', async () => {
    const { tx } = buildTx();
    await expect(seedAvailability(tx as any, users)).resolves.toMatchObject({ appointments: 2 });
  });

  it('lanza un error si faltan los bloques de las citas', async () => {
    const { tx } = buildTx();
    tx.availabilityBlock.findMany.mockResolvedValue([]);

    await expect(seedAvailability(tx as any, users, MIDWEEK)).rejects.toThrow('No se encontraron los bloques de prueba');
  });
});
