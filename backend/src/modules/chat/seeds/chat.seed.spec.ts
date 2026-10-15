import { describe, expect, it, vi } from 'vitest';
import type { Prisma } from '../../../prisma/client.js';
import {
  SEED_CONVERSATIONS,
  SEED_MESSAGE_STATUSES,
  SEED_USER_PRESENCES,
} from '../constants/seed-chat.constants.js';
import { seedChat } from './chat.seed.js';

function buildTransaction() {
  return {
    messageStatus: {
      upsert: vi.fn().mockResolvedValue({}),
      findMany: vi
        .fn()
        .mockImplementation(() =>
          Promise.resolve(
            SEED_MESSAGE_STATUSES.map((s, i) => ({
              id: `status-${i}`,
              title: s.title,
            })),
          ),
        ),
    },
    user: {
      findUniqueOrThrow: vi
        .fn()
        .mockImplementation(({ where }) =>
          Promise.resolve({ id: `user-${where.email}` }),
        ),
    },
    userPresence: {
      upsert: vi.fn().mockResolvedValue({}),
    },
    conversation: {
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi
        .fn()
        .mockImplementation(() => Promise.resolve({ id: 'conversation-new' })),
      update: vi.fn().mockResolvedValue({}),
    },
    message: {
      create: vi
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ id: 'message-new', sentAt: new Date() }),
        ),
    },
  };
}

describe('seedChat', () => {
  it('upserts every message status and every user presence', async () => {
    const tx = buildTransaction();
    const result = await seedChat(tx as unknown as Prisma.TransactionClient);

    expect(tx.messageStatus.upsert).toHaveBeenCalledTimes(
      SEED_MESSAGE_STATUSES.length,
    );
    expect(tx.userPresence.upsert).toHaveBeenCalledTimes(
      SEED_USER_PRESENCES.length,
    );
    expect(result.messageStatuses).toBe(SEED_MESSAGE_STATUSES.length);
    expect(result.userPresences).toBe(SEED_USER_PRESENCES.length);
  });

  it('creates every seeded conversation and its messages on a fresh DB', async () => {
    const tx = buildTransaction();
    const result = await seedChat(tx as unknown as Prisma.TransactionClient);

    const expectedMessages = SEED_CONVERSATIONS.reduce(
      (sum, c) => sum + c.messages.length,
      0,
    );

    expect(result.conversations).toBe(SEED_CONVERSATIONS.length);
    expect(result.messages).toBe(expectedMessages);
    expect(tx.conversation.create).toHaveBeenCalledTimes(
      SEED_CONVERSATIONS.length,
    );
    expect(tx.message.create).toHaveBeenCalledTimes(expectedMessages);
  });

  it('does not duplicate conversations on re-run', async () => {
    const tx = buildTransaction();
    tx.conversation.findUnique.mockResolvedValue({ id: 'existing' });

    const result = await seedChat(tx as unknown as Prisma.TransactionClient);

    expect(result.conversations).toBe(0);
    expect(result.messages).toBe(0);
    expect(tx.conversation.create).not.toHaveBeenCalled();
    expect(tx.message.create).not.toHaveBeenCalled();
  });

  it('propagates database errors to roll back the coordinator transaction', async () => {
    const tx = buildTransaction();
    tx.messageStatus.upsert.mockRejectedValueOnce(
      new Error('Database unavailable'),
    );

    await expect(
      seedChat(tx as unknown as Prisma.TransactionClient),
    ).rejects.toThrow('Database unavailable');
  });

  it('throws if a conversation references a message status that does not exist', async () => {
    const tx = buildTransaction();
    tx.messageStatus.findMany.mockResolvedValueOnce([]);

    await expect(
      seedChat(tx as unknown as Prisma.TransactionClient),
    ).rejects.toThrow(/Estado de mensaje desconocido/);
  });
});