import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PrismaClient } from '../../prisma/client.js';
import { runSeed } from './seeds.js';
import {
  hashSeedPassword,
  seedUsers,
} from '../../modules/users/seeds/users.seed.js';
import { seedEvents } from '../../modules/events/seeds/events.seed.js';
import { seedEventRegistrations } from '../../modules/event-registrations/seeds/event-registrations.seed.js';
import { seedAvailability } from '../../modules/availability/seeds/availability.seed.js';
import { seedAccessRequests } from '../../modules/access-requests/seeds/access-requests.seed.js';
import { seedTechnicalAreas } from '../../modules/technical-areas/seeds/technical-areas.seed.js';
import { seedOrientationTypes } from '../../modules/orientation-types/seeds/orientation-types.seed.js';

vi.mock('../../modules/users/seeds/users.seed.js', () => ({
  hashSeedPassword: vi.fn(),
  seedUsers: vi.fn(),
}));
vi.mock('../../modules/events/seeds/events.seed.js', () => ({
  seedEvents: vi.fn(),
}));
vi.mock(
  '../../modules/event-registrations/seeds/event-registrations.seed.js',
  () => ({ seedEventRegistrations: vi.fn() }),
);
vi.mock('../../modules/availability/seeds/availability.seed.js', () => ({
  seedAvailability: vi.fn(),
}));
vi.mock('../../modules/access-requests/seeds/access-requests.seed.js', () => ({
  seedAccessRequests: vi.fn(),
}));

vi.mock('../../modules/technical-areas/seeds/technical-areas.seed.js', () => ({
  seedTechnicalAreas: vi.fn(),
}));
vi.mock(
  '../../modules/orientation-types/seeds/orientation-types.seed.js',
  () => ({
    seedOrientationTypes: vi.fn(),
  }),
);
vi.mock('../../modules/job-offers/seeds/job-offers.seed.js', () => ({
  seedJobOffers: vi.fn(),
}));
vi.mock('../../modules/chat/seeds/chat.seed.js', () => ({
  seedChat: vi.fn().mockResolvedValue({
    messageStatuses: 4,
    userPresences: 6,
    conversations: 5,
    messages: 11,
  }),
}));

const users = {
  mentorA: { id: 'mentor' },
  graduate: { id: 'availability-graduate' },
  eventGraduate: { id: 'event-graduate' },
  emptyGraduate: { id: 'without-passes' },
};

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(hashSeedPassword).mockResolvedValue('hashed-password');
  vi.mocked(seedUsers).mockResolvedValue({
    users,
    roles: 5,
    userRoles: 7,
    legacyRoles: 0,
  } as unknown as Awaited<ReturnType<typeof seedUsers>>);
  vi.mocked(seedAvailability).mockResolvedValue({
    weeks: {},
    plan: [],
    statuses: 3,
    blocks: 9,
    appointments: 2,
    warnings: [],
  } as unknown as Awaited<ReturnType<typeof seedAvailability>>);
  vi.mocked(seedAccessRequests).mockResolvedValue({
    statuses: 5,
    documentTypes: 2,
    careers: 2,
  });
});

function buildClient() {
  const tx = {};
  const committed: object[] = [];
  const transactions: object[] = [];
  const client = {
    $transaction: vi.fn().mockImplementation(async (callback) => {
      const moduleTx = { ...tx };
      transactions.push(moduleTx);
      const result = await callback(moduleTx);
      committed.push(moduleTx);
      return result;
    }),
    $disconnect: vi.fn(),
  };
  return {
    tx,
    committed,
    transactions,
    client,
    prisma: client as unknown as PrismaClient,
  };
}

afterEach(() => vi.unstubAllEnvs());

describe('combined events and availability seed', () => {
  it('seeds passes for the original event user while retaining the availability user', async () => {
    vi.stubEnv('SEED_TRANSACTION_TIMEOUT_MS', undefined);
    const { tx, client, prisma } = buildClient();
    await runSeed(prisma);
    expect(seedTechnicalAreas).toHaveBeenCalledWith(tx);
    expect(seedOrientationTypes).toHaveBeenCalledWith(tx);
    expect(seedTechnicalAreas).toHaveBeenCalledBefore(vi.mocked(seedUsers));
    expect(seedOrientationTypes).toHaveBeenCalledBefore(vi.mocked(seedUsers));
    expect(seedUsers).toHaveBeenCalledBefore(vi.mocked(seedEvents));
    expect(seedEvents).toHaveBeenCalledWith(tx, 'event-graduate');
    expect(seedEventRegistrations).toHaveBeenCalledWith(tx, 'event-graduate');
    expect(seedEvents).toHaveBeenCalledBefore(
      vi.mocked(seedEventRegistrations),
    );
    expect(seedAvailability).toHaveBeenCalledWith(
      tx,
      expect.objectContaining({
        mentorId: 'mentor',
        graduateId: 'availability-graduate',
      }),
      expect.any(Date),
    );
    expect(seedAccessRequests).toHaveBeenCalledWith(tx);
    expect(client.$transaction).toHaveBeenCalledWith(expect.any(Function), {
      maxWait: 5000,
      timeout: 120000,
    });
    expect(client.$transaction).toHaveBeenCalledTimes(9);
    expect(client.$disconnect).not.toHaveBeenCalled();
  });

  it('uses the configured seed timeout', async () => {
    vi.stubEnv('SEED_TRANSACTION_TIMEOUT_MS', '180000');
    const { client, prisma } = buildClient();
    await runSeed(prisma);
    expect(client.$transaction).toHaveBeenCalledWith(expect.any(Function), {
      maxWait: 5000,
      timeout: 180000,
    });
  });

  it('rejects an invalid timeout before any database writes', async () => {
    vi.stubEnv('SEED_TRANSACTION_TIMEOUT_MS', '0');
    const { client, prisma } = buildClient();
    await expect(runSeed(prisma)).rejects.toThrow(
      'SEED_TRANSACTION_TIMEOUT_MS',
    );
    expect(client.$transaction).not.toHaveBeenCalled();
    expect(seedUsers).not.toHaveBeenCalled();
  });

  it('stops subsequent modules when events fail', async () => {
    const { prisma, client, committed, transactions } = buildClient();
    vi.mocked(seedEvents).mockRejectedValueOnce(new Error('Event seed failed'));
    await expect(runSeed(prisma)).rejects.toThrow('Event seed failed');
    expect(client.$transaction).toHaveBeenCalledTimes(5);
    expect(committed).toEqual(transactions.slice(0, 4));
    expect(committed).not.toContain(transactions[4]);
    expect(seedEventRegistrations).not.toHaveBeenCalled();
    expect(seedAvailability).not.toHaveBeenCalled();
  });
});
