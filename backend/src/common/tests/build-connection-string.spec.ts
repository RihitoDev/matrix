import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildDatabaseConnectionString } from '../prisma/build-connection-string.js';
function stubDbEnv(overrides: Record<string, string> = {}): void {
  vi.stubEnv('DB_USER', 'user');
  vi.stubEnv('DB_PASSWORD', 'password_db');
  vi.stubEnv('DB_HOST', 'db.example.supabase.co');
  vi.stubEnv('DB_PORT', '5432');
  vi.stubEnv('DB_NAME', 'app_db');
  vi.stubEnv('DB_SCHEMA', '');

  for (const [key, value] of Object.entries(overrides)) {
    vi.stubEnv(key, value);
  }
}
afterEach(() => {
  vi.unstubAllEnvs();
});

describe('buildDatabaseConnectionString', () => {
  it('usa sslmode=no-verify para el runtime contra un host remoto', () => {
    stubDbEnv();

    const url = buildDatabaseConnectionString('runtime');

    expect(url).toBe(
      'postgresql://user:password_db@db.example.supabase.co:5432/app_db?sslmode=no-verify',
    );
  });

  it('usa sslmode=require para migraciones contra un host remoto', () => {
    stubDbEnv();

    const url = buildDatabaseConnectionString('migrations');

    expect(url).toBe(
      'postgresql://user:password_db@db.example.supabase.co:5432/app_db?sslmode=require',
    );
  });

  it('incluye el schema solo en el URL de migraciones', () => {
    stubDbEnv({ DB_SCHEMA: 'public' });

    const migrationsUrl = buildDatabaseConnectionString('migrations');
    const runtimeUrl = buildDatabaseConnectionString('runtime');

    expect(migrationsUrl).toContain('?schema=public&sslmode=require');
    expect(runtimeUrl).not.toContain('schema=');
  });

  it('omite sslmode para hosts locales', () => {
    stubDbEnv({ DB_HOST: 'localhost' });

    expect(buildDatabaseConnectionString('runtime')).toBe(
      'postgresql://user:password_db@localhost:5432/app_db',
    );
    expect(buildDatabaseConnectionString('migrations')).toBe(
      'postgresql://user:password_db@localhost:5432/app_db',
    );
  });

  it('omite sslmode para el host del servicio de docker compose', () => {
    stubDbEnv({ DB_HOST: 'postgres' });

    expect(buildDatabaseConnectionString('migrations')).toBe(
      'postgresql://user:password_db@postgres:5432/app_db',
    );
  });

  it('formatea correctamente sockets de Cloud SQL y codifica caracteres especiales', () => {
    stubDbEnv({
      DB_USER: 'postgres',
      DB_PASSWORD: 'RihitoGG#5700',
      DB_HOST: '/cloudsql/daty-76e04:us-central1:umsy-db',
      DB_NAME: 'umsy-database',
      DB_SCHEMA: 'public',
    });

    const migrationsUrl = buildDatabaseConnectionString('migrations');
    expect(migrationsUrl).toBe(
      'postgresql://postgres:RihitoGG%235700@localhost/umsy-database?schema=public&host=/cloudsql/daty-76e04:us-central1:umsy-db',
    );

    const runtimeUrl = buildDatabaseConnectionString('runtime');
    expect(runtimeUrl).toBe(
      'postgresql://postgres:RihitoGG%235700@localhost/umsy-database?host=/cloudsql/daty-76e04:us-central1:umsy-db',
    );
  });
});

