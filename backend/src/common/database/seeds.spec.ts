import { beforeEach, describe, expect, it, vi } from 'vitest';
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
vi.mock('../../modules/orientation-types/seeds/orientation-types.seed.js', () => ({
  seedOrientationTypes: vi.fn(),
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
  const client = {
    $transaction: vi.fn().mockImplementation((callback) => callback(tx)),
    $disconnect: vi.fn(),
  };
  return { tx, client, prisma: client as unknown as PrismaClient };
}

describe('combined events and availability seed', () => {
  it('seeds passes for the original event user while retaining the availability user', async () => {
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
    expect(client.$transaction).toHaveBeenCalledTimes(1);
    expect(client.$disconnect).not.toHaveBeenCalled();
  });

  it('propagates event failures to roll back the shared transaction', async () => {
    const { prisma } = buildClient();
    vi.mocked(seedEvents).mockRejectedValueOnce(new Error('Event seed failed'));
    await expect(runSeed(prisma)).rejects.toThrow('Event seed failed');
    expect(seedEventRegistrations).not.toHaveBeenCalled();
    expect(seedAvailability).not.toHaveBeenCalled();
  });
});
