// seed-chat-once.ts — one-shot script, delete after use.
import { seedChat } from './src/modules/chat/seeds/chat.seed.js';
import { createSeedClient } from './src/common/database/seeds.js';

const prisma = createSeedClient();

async function main() {
  const result = await seedChat(prisma);
  console.log(result);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());