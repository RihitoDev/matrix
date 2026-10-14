import { Logger } from '@nestjs/common';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { runSeedStage } from '../database/run-seed-stage.js';

describe('runSeedStage', () => {
  afterEach(() => vi.restoreAllMocks());

  it('reports stage duration without logging returned data', async () => {
    const log = vi
      .spyOn(Logger.prototype, 'log')
      .mockImplementation(() => undefined);
    vi.spyOn(performance, 'now')
      .mockReturnValueOnce(100)
      .mockReturnValueOnce(350);
    const data = { password: 'not-for-logs', email: 'private@test.com' };
    await expect(runSeedStage('usuarios', async () => data)).resolves.toBe(
      data,
    );
    expect(log).toHaveBeenCalledWith('Iniciando etapa: usuarios');
    expect(log).toHaveBeenCalledWith('Etapa usuarios completada en 250 ms');
    expect(JSON.stringify(log.mock.calls)).not.toContain('not-for-logs');
    expect(JSON.stringify(log.mock.calls)).not.toContain('private@test.com');
  });

  it('identifies the failing stage and propagates the original error for rollback', async () => {
    vi.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    const logError = vi
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
    vi.spyOn(performance, 'now')
      .mockReturnValueOnce(100)
      .mockReturnValueOnce(600);
    const error = new Error('failure with private details');
    await expect(
      runSeedStage('solicitudes', async () => {
        throw error;
      }),
    ).rejects.toBe(error);
    expect(logError).toHaveBeenCalledExactlyOnceWith(
      'Etapa solicitudes falló tras 500 ms',
    );
  });
});
