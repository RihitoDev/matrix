import type { PrismaService } from '../../../common/prisma/prisma.service.js';
import { CSV_BOM } from '../../../common/utils/csv.js';
import { ReportUsersRepository } from '../repositories/report-users.repository.js';
import {
  ALL_FILTER_VALUE,
  registeredUsersFiltersSchema,
  registeredUsersQuerySchema,
} from '../requests/report-users.schema.js';
import { ReportsService } from '../services/reports.service.js';
import type { RoleName } from '../../../common/enums/roles.enum.js';
import type {
  RegisteredUserResponse,
  ReportUser,
} from '../types/report-user.types.js';
import { getAcademicPeriod } from '../utils/academic-period.js';

const PAGE_SIZE = 10;

const PERIOD_DATES = {
  'I-2025': '2025-03-15T12:00:00.000Z',
  'II-2025': '2025-09-15T12:00:00.000Z',
  'I-2026': '2026-03-15T12:00:00.000Z',
} as const;

type SeededPeriod = keyof typeof PERIOD_DATES;

const SEED: Record<SeededPeriod, Partial<Record<RoleName, number>>> = {
  'I-2025': { estudiante: 6, mentor: 4 },
  'II-2025': { estudiante: 12, titulado: 11, empresa: 2 },
  'I-2026': { administrativo: 3, estudiante: 1 },
};

function countFor(period: SeededPeriod, userType?: RoleName): number {
  const counts = SEED[period];
  return userType
    ? (counts[userType] ?? 0)
    : Object.values(counts).reduce((total, count) => total + count, 0);
}

function buildUser(
  period: SeededPeriod,
  userType: RoleName,
  index: number,
  overrides: Partial<ReportUser> = {},
): ReportUser {
  const id = `${period}-${userType}-${String(index).padStart(2, '0')}`;

  return {
    id,
    fullName: `Usuario ${id}`,
    email: `${id.toLowerCase()}@example.com`,
    userType,
    identifier: `ID-${id}`,
    documentType: 'academic_diploma',
    registeredAt: PERIOD_DATES[period],
    registrationStatus: 'APPROVED',
    rejectionReason: null,
    ...overrides,
  };
}

function buildDataset(): ReportUser[] {
  const approved = (Object.keys(SEED) as SeededPeriod[]).flatMap((period) =>
    Object.entries(SEED[period]).flatMap(([userType, count]) =>
      Array.from({ length: count }, (_, index) =>
        buildUser(period, userType as RoleName, index),
      ),
    ),
  );
  const notApproved = (Object.keys(SEED) as SeededPeriod[]).flatMap(
    (period) => [
      buildUser(period, 'estudiante', 91, { registrationStatus: 'REJECTED' }),
    ],
  );

  return [...approved, ...notApproved].reverse();
}

function buildService(users: readonly ReportUser[]): ReportsService {
  const repository = new ReportUsersRepository({} as PrismaService);
  vi.spyOn(repository, 'findAll').mockResolvedValue([...users]);
  return new ReportsService(repository);
}

const query = (input: Record<string, unknown> = {}) =>
  registeredUsersQuerySchema.parse(input);

async function collectAllPages(
  service: ReportsService,
  filters: Record<string, unknown>,
): Promise<RegisteredUserResponse[][]> {
  const { totalPages } = await service.getRegisteredUsers(query(filters));

  return Promise.all(
    Array.from({ length: totalPages }, async (_, index) => {
      const result = await service.getRegisteredUsers(
        query({ ...filters, page: index + 1 }),
      );
      return result.items;
    }),
  );
}

describe('Reporte de usuarios registrados: filtro por gestión semestral (HU07)', () => {
  const dataset = buildDataset();
  const service = buildService(dataset);
  const totalApproved = (Object.keys(SEED) as SeededPeriod[]).reduce(
    (total, period) => total + countFor(period),
    0,
  );

  describe('gestión I/II según la fecha de registro en hora de Bolivia', () => {
    it.each([
      { isoDate: '2025-01-01T04:00:00.000Z', expected: 'I-2025' },
      { isoDate: '2025-06-30T12:00:00.000Z', expected: 'I-2025' },
      { isoDate: '2025-07-01T03:59:00.000Z', expected: 'I-2025' },
      { isoDate: '2025-07-01T04:00:00.000Z', expected: 'II-2025' },
      { isoDate: '2025-12-31T12:00:00.000Z', expected: 'II-2025' },
      { isoDate: '2026-01-01T02:00:00.000Z', expected: 'II-2025' },
    ])('$isoDate pertenece a $expected', ({ isoDate, expected }) => {
      expect(getAcademicPeriod(isoDate)).toBe(expected);
    });
  });

  describe('filtrado exacto por gestión', () => {
    it.each(Object.keys(SEED) as SeededPeriod[])(
      '%s devuelve solo usuarios de esa gestión, de todos los tipos',
      async (period) => {
        const users = (await collectAllPages(service, { period })).flat();

        expect(users).toHaveLength(countFor(period));
        expect(
          users.every(
            (user) => getAcademicPeriod(user.registeredAt) === period,
          ),
        ).toBe(true);
        expect(new Set(users.map((user) => user.userType))).toEqual(
          new Set(Object.keys(SEED[period])),
        );
      },
    );

    it('excluye los registros de gestiones vecinas en el cambio de semestre', async () => {
      const boundaryService = buildService([
        buildUser('I-2025', 'estudiante', 1, {
          registeredAt: '2025-07-01T03:59:00.000Z',
        }),
        buildUser('II-2025', 'estudiante', 2, {
          registeredAt: '2025-07-01T04:00:00.000Z',
        }),
      ]);

      expect(
        (
          await boundaryService.getRegisteredUsers(query({ period: 'I-2025' }))
        ).items.map((user) => user.id),
      ).toEqual(['I-2025-estudiante-01']);
      expect(
        (
          await boundaryService.getRegisteredUsers(query({ period: 'II-2025' }))
        ).items.map((user) => user.id),
      ).toEqual(['II-2025-estudiante-02']);
    });

    it.each([{}, { period: ALL_FILTER_VALUE }])(
      'sin gestión o con "ALL" no restringe por gestión (%o)',
      async (filters) => {
        expect(
          (await service.getRegisteredUsers(query(filters))).totalItems,
        ).toBe(totalApproved);
      },
    );

    it('nunca incluye usuarios pendientes ni rechazados de la gestión', async () => {
      const ids = (await collectAllPages(service, { period: 'II-2025' }))
        .flat()
        .map((user) => user.id);

      expect(ids.some((id) => id.endsWith('-90') || id.endsWith('-91'))).toBe(
        false,
      );
    });
  });

  describe('filtros combinados de gestión y tipo de usuario', () => {
    it.each([
      { period: 'II-2025', userType: 'titulado' },
      { period: 'II-2025', userType: 'estudiante' },
      { period: 'I-2025', userType: 'mentor' },
      { period: 'I-2026', userType: 'administrativo' },
    ] as const)(
      '$period + $userType devuelve la intersección de ambos criterios',
      async ({ period, userType }) => {
        const users = (
          await collectAllPages(service, { period, userType })
        ).flat();

        expect(users).toHaveLength(countFor(period, userType));
        users.forEach((user) => {
          expect(user.userType).toBe(userType);
          expect(getAcademicPeriod(user.registeredAt)).toBe(period);
        });
      },
    );

    it('el orden en que se envían los filtros no cambia el resultado', async () => {
      const periodFirst = await collectAllPages(service, {
        period: 'II-2025',
        userType: 'estudiante',
      });
      const userTypeFirst = await collectAllPages(service, {
        userType: 'estudiante',
        period: 'II-2025',
      });

      expect(userTypeFirst).toEqual(periodFirst);
    });

    it('una combinación sin registros devuelve vacío sin mezclar otros tipos', async () => {
      const result = await service.getRegisteredUsers(
        query({ period: 'I-2026', userType: 'empresa' }),
      );

      expect(result).toMatchObject({
        items: [],
        totalItems: 0,
        totalPages: 0,
      });
    });
  });

  describe('paginación sobre el subconjunto filtrado', () => {
    it('con exactamente 10 registros en la gestión calcula una sola página', async () => {
      const result = await service.getRegisteredUsers(
        query({ period: 'I-2025' }),
      );

      expect(result).toMatchObject({ totalItems: 10, totalPages: 1 });
      expect(result.items).toHaveLength(10);
      expect(
        (await service.getRegisteredUsers(query({ period: 'I-2025', page: 2 })))
          .items,
      ).toEqual([]);
    });

    it('con más de 10 registros calcula las páginas solo sobre la gestión', async () => {
      const result = await service.getRegisteredUsers(
        query({ period: 'II-2025' }),
      );

      expect(result).toMatchObject({ totalItems: 25, totalPages: 3 });
      expect(
        (await collectAllPages(service, { period: 'II-2025' })).map(
          (page) => page.length,
        ),
      ).toEqual([10, 10, 5]);
    });

    it('una gestión sin registros devuelve lista vacía y 0 páginas', async () => {
      expect(
        await service.getRegisteredUsers(query({ period: 'II-2026' })),
      ).toEqual({
        items: [],
        totalItems: 0,
        totalPages: 0,
        page: 1,
        limit: PAGE_SIZE,
      });
    });

    it.each([
      { period: 'II-2025' },
      { period: 'II-2025', userType: 'estudiante' },
      { period: 'II-2025', userType: 'titulado' },
    ])(
      'recorrer todas las páginas de %o no repite ni omite usuarios con la misma fecha',
      async (filters) => {
        const { totalItems } = await service.getRegisteredUsers(query(filters));
        const ids = (await collectAllPages(service, filters))
          .flat()
          .map((user) => user.id);

        expect(ids).toHaveLength(totalItems);
        expect(new Set(ids).size).toBe(totalItems);
        expect(ids).toEqual([...ids].sort((a, b) => a.localeCompare(b)));
      },
    );

    it('el orden no depende del orden en que llegan los datos', async () => {
      const shuffled = buildService([...dataset].reverse());

      expect(await collectAllPages(shuffled, { period: 'II-2025' })).toEqual(
        await collectAllPages(service, { period: 'II-2025' }),
      );
    });

    it('consultar la misma gestión varias veces devuelve lo mismo', () => {
      const pageTwo = async () =>
        await service.getRegisteredUsers(query({ period: 'II-2025', page: 2 }));

      expect(pageTwo()).toEqual(pageTwo());
    });

    it('cambiar entre gestiones devuelve solo los datos de la última', async () => {
      await service.getRegisteredUsers(query({ period: 'II-2025' }));
      const last = await service.getRegisteredUsers(
        query({ period: 'I-2026' }),
      );

      expect(
        last.items.every(
          (user) => getAcademicPeriod(user.registeredAt) === 'I-2026',
        ),
      ).toBe(true);
      expect(last.totalItems).toBe(countFor('I-2026'));
    });
  });

  describe('integridad de los 6 campos por usuario', () => {
    const sourceById = new Map(dataset.map((user) => [user.id, user]));

    it('cada fila filtrada por gestión trae los 6 campos del mismo usuario', async () => {
      for (const user of (
        await collectAllPages(service, {
          period: 'II-2025',
        })
      ).flat()) {
        const source = sourceById.get(user.id);

        expect(user).toEqual({
          id: source?.id,
          fullName: source?.fullName,
          email: source?.email,
          userType: source?.userType,
          identifier: source?.identifier,
          documentType: source?.documentType,
          registeredAt: source?.registeredAt,
        });
      }
    });
  });

  describe('exportación CSV con la gestión activa', () => {
    const csvRows = async (filters: Record<string, unknown>) =>
      (
        await service.exportRegisteredUsersCsv(
          registeredUsersFiltersSchema.parse(filters),
        )
      ).content
        .replace(CSV_BOM, '')
        .trim()
        .split('\r\n')
        .slice(1);

    it('exporta todos los usuarios de la gestión, no solo los 10 de una página', async () => {
      expect(await csvRows({ period: 'II-2025' })).toHaveLength(25);
    });

    it('exporta la intersección de gestión y tipo de usuario completa', async () => {
      const rows = await csvRows({ period: 'II-2025', userType: 'estudiante' });

      expect(rows).toHaveLength(12);
      expect(rows.every((row) => row.split(',')[2] === 'Estudiante')).toBe(
        true,
      );
    });

    it('exporta solo la cabecera si la gestión no tiene registros', async () => {
      expect(await csvRows({ period: 'II-2026' })).toEqual([]);
    });

    it('nombra el archivo con el tipo de usuario y la gestión', async () => {
      const { fileName } = await service.exportRegisteredUsersCsv(
        registeredUsersFiltersSchema.parse({
          period: 'II-2025',
          userType: 'estudiante',
        }),
      );

      expect(fileName).toBe('usuarios-registrados-estudiante-II-2025.csv');
    });

    it('"ALL" exporta igual que no enviar la gestión', () => {
      expect(csvRows({ period: ALL_FILTER_VALUE })).toEqual(csvRows({}));
    });
  });

  describe('validación de la gestión', () => {
    it.each(['I-2025', 'II-2025', 'I-2020', ' II-2026 '])(
      'acepta la gestión %s',
      (period) => {
        expect(registeredUsersQuerySchema.safeParse({ period }).success).toBe(
          true,
        );
      },
    );

    it.each([
      '1-2025',
      '2-2025',
      'III-2025',
      'i-2025',
      'I_2025',
      '2025',
      '',
      "I-2025' OR '1'='1",
    ])('rechaza la gestión %s', (period) => {
      const result = registeredUsersQuerySchema.safeParse({ period });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].path).toEqual(['period']);
    });

    it('ya no acepta el filtro por año, reemplazado por la gestión', () => {
      expect(
        registeredUsersQuerySchema.parse({ year: '2025' }),
      ).not.toHaveProperty('year');
    });
  });
});
