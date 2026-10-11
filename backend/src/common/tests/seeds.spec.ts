import { afterEach, describe, expect, it, vi } from 'vitest';

const seedUsers = vi.fn();
const seedAvailability = vi.fn();
const seedAccessRequests = vi.fn();
const seedTechnicalAreas = vi.fn();
const seedOrientationTypes = vi.fn();
const seedJobOffers = vi.fn();

vi.mock('../../modules/users/seeds/users.seed.js', () => ({
  hashSeedPassword: vi.fn().mockResolvedValue('hash'),
  seedUsers: (...args: unknown[]) => seedUsers(...args),
}));
vi.mock('../../modules/availability/seeds/availability.seed.js', () => ({
  seedAvailability: (...args: unknown[]) => seedAvailability(...args),
}));
vi.mock('../../modules/access-requests/seeds/access-requests.seed.js', () => ({
  seedAccessRequests: (...args: unknown[]) => seedAccessRequests(...args),
}));
vi.mock('../../modules/technical-areas/seeds/technical-areas.seed.js', () => ({
  seedTechnicalAreas: (...args: unknown[]) => seedTechnicalAreas(...args),
}));
vi.mock('../../modules/orientation-types/seeds/orientation-types.seed.js', () => ({
  seedOrientationTypes: (...args: unknown[]) => seedOrientationTypes(...args),
}));
vi.mock('../../modules/job-offers/seeds/job-offers.seed.js', () => ({
  seedJobOffers: (...args: unknown[]) => seedJobOffers(...args),
}));

const { createSeedClient, loadSeedEnv, runSeed } = await import('../database/seeds.js');

const validEnv = { DB_USER: 'u', DB_PASSWORD: 'p', DB_NAME: 'n', DB_HOST: 'h', DB_PORT: '5432' };

function setupSeeds() {
  const user = (id: string) => ({ id });
  seedUsers.mockResolvedValue({
    users: { mentorA: user('m1'), mentorB: user('m2'), graduate: user('g1'), student: user('s1') },
    roles: 5,
    userRoles: 5,
    legacyRoles: 0,
  });
  seedAvailability.mockResolvedValue({ weeks: {}, plan: {}, statuses: 2, blocks: 56, appointments: 2, warnings: ['aviso'] });
  seedAccessRequests.mockResolvedValue({ statuses: 5, documentTypes: 2, careers: 2 });
}

describe('loadSeedEnv', () => {
  it('lee la configuración de base de datos válida', () => {
    expect(loadSeedEnv(validEnv as NodeJS.ProcessEnv)).toMatchObject({ DB_HOST: 'h', DB_PORT: 5432 });
  });

  it('lanza un error en español con las variables inválidas', () => {
    expect(() => loadSeedEnv({} as NodeJS.ProcessEnv)).toThrow('Configuración de base de datos inválida');
  });

  it('usa process.env por defecto', () => {
    vi.stubEnv('DB_USER', 'u');
    vi.stubEnv('DB_PASSWORD', 'p');
    vi.stubEnv('DB_NAME', 'n');
    vi.stubEnv('DB_HOST', 'h');
    vi.stubEnv('DB_PORT', '5432');
    expect(loadSeedEnv().DB_NAME).toBe('n');
  });
});

describe('createSeedClient', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('crea un cliente con el esquema indicado', () => {
    vi.stubEnv('DB_USER', 'u');
    vi.stubEnv('DB_PASSWORD', 'p');
    vi.stubEnv('DB_NAME', 'n');
    vi.stubEnv('DB_HOST', 'h');
    vi.stubEnv('DB_PORT', '5432');

    expect(createSeedClient({ ...validEnv, DB_PORT: 5432, DB_SCHEMA: 'test' } as never)).toBeDefined();
    expect(createSeedClient({ ...validEnv, DB_PORT: 5432 } as never)).toBeDefined();
  });
});

describe('runSeed', () => {
  afterEach(() => vi.clearAllMocks());

  it('ejecuta los seeds en orden dentro de una sola transacción y arma el resumen', async () => {
    setupSeeds();
    const tx = {};
    const client = { $transaction: vi.fn().mockImplementation(async (fn) => fn(tx)), $disconnect: vi.fn() };

    const summary = await runSeed(client as never);

    expect(client.$transaction).toHaveBeenCalledOnce();
    expect(seedTechnicalAreas).toHaveBeenCalledWith(tx);
    expect(seedOrientationTypes).toHaveBeenCalledWith(tx);
    expect(seedJobOffers).toHaveBeenCalledWith(tx);
    expect(seedUsers).toHaveBeenCalledWith(tx, 'hash');
    expect(seedAvailability).toHaveBeenCalledWith(tx, expect.objectContaining({ mentorId: 'm1', graduateId: 'g1' }), expect.any(Date));
    expect(seedAccessRequests).toHaveBeenCalledWith(tx);
    expect(summary).toMatchObject({
      roles: 5,
      statuses: 2,
      users: 5,
      userRoles: 5,
      blocks: 56,
      appointments: 2,
      warnings: ['aviso'],
      accessRequests: { statuses: 5, documentTypes: 2, careers: 2 },
    });
    expect(client.$disconnect).not.toHaveBeenCalled();
  });
});
