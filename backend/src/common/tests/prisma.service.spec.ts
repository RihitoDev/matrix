import { beforeAll, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service.js';

beforeAll(() => {
  process.env.DB_USER ??= 'user';
  process.env.DB_PASSWORD ??= 'password';
  process.env.DB_HOST ??= 'localhost';
  process.env.DB_PORT ??= '5432';
  process.env.DB_NAME ??= 'test_db';
});

describe('PrismaService', () => {
  it('conecta y desconecta a traves de los hooks del ciclo de vida', async () => {
    const service = new PrismaService();
    const connectSpy = vi.spyOn(service, '$connect').mockResolvedValue(undefined);
    const disconnectSpy = vi.spyOn(service, '$disconnect').mockResolvedValue(undefined);

    await service.onModuleInit();
    await service.onModuleDestroy();

    expect(connectSpy).toHaveBeenCalledOnce();
    expect(disconnectSpy).toHaveBeenCalledOnce();
  });
});