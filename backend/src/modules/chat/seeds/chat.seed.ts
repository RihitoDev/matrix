import type { Prisma } from '../../../prisma/client.js';
import {
  SEED_CONVERSATIONS,
  SEED_MESSAGE_STATUSES,
  SEED_USER_PRESENCES,
} from '../constants/seed-chat.constants.js';
import type { ChatSeedResult } from '../types/chat-seed-result.types.js';

const MS_PER_MINUTE = 60_000;

async function seedMessageStatuses(
  tx: Prisma.TransactionClient,
): Promise<number> {
  for (const status of SEED_MESSAGE_STATUSES) {
    await tx.messageStatus.upsert({
      where: { title: status.title },
      create: { title: status.title, description: status.description },
      update: { description: status.description },
    });
  }
  return SEED_MESSAGE_STATUSES.length;
}

async function seedUserPresences(
  tx: Prisma.TransactionClient,
  now: number,
): Promise<number> {
  let count = 0;
  for (const presence of SEED_USER_PRESENCES) {
    const user = await tx.user.findUniqueOrThrow({
      where: { email: presence.email },
      select: { id: true },
    });

    const lastSeenAt =
      presence.minutesAgo === undefined
        ? new Date(now)
        : new Date(now - presence.minutesAgo * MS_PER_MINUTE);

    await tx.userPresence.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        isOnline: presence.isOnline,
        lastSeenAt,
      },
      update: {
        isOnline: presence.isOnline,
        lastSeenAt,
      },
    });
    count += 1;
  }
  return count;
}

function resolveLastReadAt(
  spec: 'now' | { minutesAgo: number },
  now: number,
): Date {
  return spec === 'now'
    ? new Date(now)
    : new Date(now - spec.minutesAgo * MS_PER_MINUTE);
}

async function seedConversations(
  tx: Prisma.TransactionClient,
  statusIdByTitle: Map<string, string>,
  now: number,
): Promise<{ conversations: number; messages: number }> {
  let conversations = 0;
  let messages = 0;

  for (const definition of SEED_CONVERSATIONS) {
    const userA = await tx.user.findUniqueOrThrow({
      where: { email: definition.userAEmail },
      select: { id: true },
    });
    const userB = await tx.user.findUniqueOrThrow({
      where: { email: definition.userBEmail },
      select: { id: true },
    });

    const [userAId, userBId] =
      userA.id < userB.id ? [userA.id, userB.id] : [userB.id, userA.id];

    // Idempotencia: si ya existe, no la recreamos ni duplicamos mensajes.
    const existing = await tx.conversation.findUnique({
      where: { userAId_userBId: { userAId, userBId } },
      select: { id: true },
    });
    if (existing) continue;

    const conversation = await tx.conversation.create({
      data: {
        userAId,
        userBId,
        participants: {
          createMany: {
            data: [
              {
                userId: userA.id,
                lastReadAt: resolveLastReadAt(definition.lastReadAtByA, now),
              },
              {
                userId: userB.id,
                lastReadAt: resolveLastReadAt(definition.lastReadAtByB, now),
              },
            ],
          },
        },
      },
      select: { id: true },
    });
    conversations += 1;

    let lastMessageId: string | null = null;
    let lastMessageAt: Date | null = null;

    for (const message of definition.messages) {
      const senderId = message.fromA ? userA.id : userB.id;
      const sentAt = new Date(now - message.minutesAgo * MS_PER_MINUTE);
      const statusId = statusIdByTitle.get(message.status);
      if (!statusId) {
        throw new Error(
          `Estado de mensaje desconocido en seed: ${message.status}`,
        );
      }

      const created = await tx.message.create({
        data: {
          conversationId: conversation.id,
          senderId,
          content: message.content,
          statusId,
          sentAt,
        },
        select: { id: true, sentAt: true },
      });
      messages += 1;
      lastMessageId = created.id;
      lastMessageAt = created.sentAt;
    }

    if (lastMessageId && lastMessageAt) {
      await tx.conversation.update({
        where: { id: conversation.id },
        data: { lastMessageId, lastMessageAt },
      });
    }
  }

  return { conversations, messages };
}

export async function seedChat(
  tx: Prisma.TransactionClient,
): Promise<ChatSeedResult> {
  const now = Date.now();

  const messageStatuses = await seedMessageStatuses(tx);

  const statuses = await tx.messageStatus.findMany({
    select: { id: true, title: true },
  });
  const statusIdByTitle = new Map(statuses.map((s) => [s.title, s.id]));

  const userPresences = await seedUserPresences(tx, now);
  const { conversations, messages } = await seedConversations(
    tx,
    statusIdByTitle,
    now,
  );

  return { messageStatuses, userPresences, conversations, messages };
}