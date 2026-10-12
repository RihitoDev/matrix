import { describe, it, expect, vi, afterEach } from 'vitest';

describe('ENV_CONFIG', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('usa NEXT_PUBLIC_API_URL_LOCAL cuando el entorno es local', async () => {
    vi.stubEnv('NEXT_PUBLIC_APP_ENV', 'local');
    vi.stubEnv('NEXT_PUBLIC_API_URL_LOCAL', 'http://localhost:8080/api');

    const { ENV_CONFIG } = await import('./env.config');

    expect(ENV_CONFIG.apiUrl).toBe('http://localhost:8080/api');
  });

  it('lanza un error si falta la variable del entorno activo', async () => {
    vi.stubEnv('NEXT_PUBLIC_APP_ENV', 'dev');
    vi.stubEnv('NEXT_PUBLIC_API_URL_DEV', '');

    await expect(import('./env.config')).rejects.toThrow();
  });
});