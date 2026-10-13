import type { PrismaService } from '../../../common/prisma/prisma.service.js';
import { ReportUsersRepository } from '../repositories/report-users.repository.js';
import {
  ALL_FILTER_VALUE,
  registeredUsersFiltersSchema,
  registeredUsersQuerySchema,
} from '../requests/report-users.schema.js';
import { ReportsService } from '../services/reports.service.js';
import { ROLE_NAMES, type RoleName } from '../../../common/enums/roles.enum.js';
import type {
  RegisteredUserResponse,
  ReportRegistrationStatus,
  ReportUser,
} from '../types/report-user.types.js';

const PAGE_SIZE = 10;
const SAME_REGISTRATION_DATE = '2026-04-01T12:00:00.000Z';

const APPROVED_COUNT_BY_TYPE: Record<RoleName, number> = {
  estudiante: 10,
  titulado: 23,
  mentor: 11,
  empresa: 0,
  administrativo: 2,
};

const TOTAL_APPROVED = Object.values(APPROVED_COUNT_BY_TYPE).reduce(
  (total, count) => total + count,
  0,
);

const REQUIRED_FIELDS = [
  'fullName',
  'email',
  'userType',
  'identifier',
  'documentType',
  'registeredAt',
] as const;

function buildUser(
  userType: RoleName,
  index: number,
  registrationStatus: ReportRegistrationStatus = 'APPROVED',
): ReportUser {
  const id = `${userType.toLowerCase()}-${registrationStatus.toLowerCase()}-${String(index).padStart(2, '0')}`;
  const registeredAt =
    userType === 'titulado'
      ? SAME_REGISTRATION_DATE
      : new Date(Date.UTC(2026, 0, 1 + index)).toISOString();

  return {
    id,
    fullName: `Nombre ${id}`,
    email: `${id}@example.com`,
    userType,
    identifier: `IDENT-${id}`,
    documentType: userType === 'empresa' ? null : 'academic_diploma',
    registeredAt,
    registrationStatus,
    rejectionReason: registrationStatus === 'REJECTED' ? 'Sin documento' : null,
  };
}

function buildDataset(): ReportUser[] {
  const approved = ROLE_NAMES.flatMap((userType) =>
    Array.from({ length: APPROVED_COUNT_BY_TYPE[userType] }, (_, index) =>
      buildUser(userType, index),
    ),
  );
  const notApproved = ROLE_NAMES.flatMap((userType) => [
    buildUser(userType, 0, 'REJECTED'),
  ]);

  return [...approved, ...notApproved].sort((first, second) =>
    first.email.length % 3 === second.email.length % 3
      ? second.id.localeCompare(first.id)
      : (first.email.length % 3) - (second.email.length % 3),
  );
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
  userType?: string,
): Promise<RegisteredUserResponse[][]> {
  const firstPage = await service.getRegisteredUsers(query({ userType }));

  return Promise.all(
    Array.from({ length: firstPage.totalPages }, async (_, index) => {
      const result = await service.getRegisteredUsers(
        query({ userType, page: index + 1 }),
      );
      return result.items;
    }),
  );
}

describe('Reporte de usuarios registrados: filtro por tipo de usuario (HU02)', () => {
  const dataset = buildDataset();
  const service = buildService(dataset);

  describe('CA 3 y CA 11: sin filtro o con "Todos"', () => {
    it.each([
      { case: 'sin userType', input: {} },
      { case: 'con userType=ALL', input: { userType: ALL_FILTER_VALUE } },
    ])('devuelve los aprobados de todos los tipos $case', async ({ input }) => {
      const result = await service.getRegisteredUsers(query(input));

      expect(result.totalItems).toBe(TOTAL_APPROVED);
      expect(result.totalPages).toBe(Math.ceil(TOTAL_APPROVED / PAGE_SIZE));
      expect(result.items).toHaveLength(PAGE_SIZE);
    });

    it('"Todos" y omitir el parámetro devuelven exactamente lo mismo', async () => {
      expect(await collectAllPages(service, ALL_FILTER_VALUE)).toEqual(
        await collectAllPages(service),
      );
    });

    it('incluye registros de todos los tipos que tienen aprobados', async () => {
      const userTypes = new Set(
        (await collectAllPages(service)).flat().map((user) => user.userType),
      );

      expect([...userTypes].sort()).toEqual(
        ROLE_NAMES.filter(
          (userType) => APPROVED_COUNT_BY_TYPE[userType] > 0,
        ).sort(),
      );
    });

    it('nunca incluye usuarios pendientes ni rechazados', async () => {
      const ids = (await collectAllPages(service))
        .flat()
        .map((user) => user.id);

      expect(ids.some((id) => /pending|rejected/.test(id))).toBe(false);
    });
  });

  describe('CA 4 y CA 5: filtrado exacto por tipo de usuario', () => {
    it('acepta solo los 5 tipos de usuario del reporte', () => {
      expect(ROLE_NAMES).toEqual([
        'titulado',
        'estudiante',
        'mentor',
        'empresa',
        'administrativo',
      ]);
    });

    it.each(['GRADUATE', 'Egresado', 'egresado', 'EGRESADO'])(
      'rechaza el tipo de usuario %s por no existir',
      (userType) => {
        const result = registeredUsersQuerySchema.safeParse({ userType });

        expect(result.success).toBe(false);
        expect(result.error?.issues[0].path).toEqual(['userType']);
      },
    );

    it.each(ROLE_NAMES)(
      'con userType=%s solo devuelve usuarios de ese tipo',
      async (userType) => {
        const users = (await collectAllPages(service, userType)).flat();

        expect(users).toHaveLength(APPROVED_COUNT_BY_TYPE[userType]);
        expect(users.every((user) => user.userType === userType)).toBe(true);
      },
    );
  });

  describe('CA 6 y CA 27: totales calculados sobre el subconjunto filtrado', () => {
    it.each(ROLE_NAMES)(
      'totalItems y totalPages de %s no usan el total general',
      async (userType) => {
        const result = await service.getRegisteredUsers(query({ userType }));
        const expectedTotal = APPROVED_COUNT_BY_TYPE[userType];

        expect(result.totalItems).toBe(expectedTotal);
        expect(result.totalPages).toBe(Math.ceil(expectedTotal / PAGE_SIZE));
        expect(result.totalItems).not.toBe(TOTAL_APPROVED);
      },
    );

    it('los totales no cambian según la página consultada', async () => {
      const totals = await Promise.all(
        [1, 2, 3, 4].map(async (page) => {
          const result = await service.getRegisteredUsers(
            query({ userType: 'titulado', page }),
          );
          return [result.totalItems, result.totalPages];
        }),
      );

      expect(new Set(totals.map((total) => total.join('/'))).size).toBe(1);
      expect(totals[0]).toEqual([23, 3]);
    });
  });

  describe('CA 7 y CA 14: máximo 10 registros por página', () => {
    it('con exactamente 10 registros calcula una sola página', async () => {
      const result = await service.getRegisteredUsers(
        query({ userType: 'estudiante' }),
      );

      expect(result).toMatchObject({ totalItems: 10, totalPages: 1 });
      expect(result.items).toHaveLength(10);
    });

    it('con exactamente 10 registros la página 2 no existe y viene vacía', async () => {
      const result = await service.getRegisteredUsers(
        query({ userType: 'estudiante', page: 2 }),
      );

      expect(result.items).toEqual([]);
      expect(result).toMatchObject({ totalItems: 10, totalPages: 1 });
    });

    it('con 11 registros calcula 2 páginas y la segunda tiene 1 registro', async () => {
      const [firstPage, secondPage] = await collectAllPages(service, 'mentor');

      expect(
        (await service.getRegisteredUsers(query({ userType: 'mentor' })))
          .totalPages,
      ).toBe(2);
      expect(firstPage).toHaveLength(10);
      expect(secondPage).toHaveLength(1);
    });

    it('ninguna página supera los 10 registros', async () => {
      for (const userType of [undefined, ...ROLE_NAMES]) {
        for (const page of await collectAllPages(service, userType)) {
          expect(page.length).toBeLessThanOrEqual(PAGE_SIZE);
        }
      }
    });

    it.each(['11', '50', '100'])(
      'rechaza un límite de %s registros',
      (limit) => {
        expect(registeredUsersQuerySchema.safeParse({ limit }).success).toBe(
          false,
        );
      },
    );
  });

  describe('CA 8: el filtro se mantiene al cambiar de página', () => {
    it.each(['titulado', 'mentor'] as const)(
      'todas las páginas de %s conservan el tipo de usuario',
      async (userType) => {
        const pages = await collectAllPages(service, userType);

        expect(pages.length).toBeGreaterThan(1);
        pages.forEach((page) => {
          expect(page.every((user) => user.userType === userType)).toBe(true);
        });
      },
    );
  });

  describe('CA 10: tipo de usuario sin registros', () => {
    it('devuelve una lista vacía con totales en 0', async () => {
      const result = await service.getRegisteredUsers(
        query({ userType: 'empresa' }),
      );

      expect(result).toEqual({
        items: [],
        totalItems: 0,
        totalPages: 0,
        page: 1,
        limit: PAGE_SIZE,
      });
    });

    it('no completa con usuarios de otros tipos en ninguna página', async () => {
      for (const page of [1, 2, 5]) {
        expect(
          (
            await service.getRegisteredUsers(
              query({ userType: 'empresa', page }),
            )
          ).items,
        ).toEqual([]);
      }
    });

    it('no cuenta a las empresas rechazadas', async () => {
      const notApprovedCompanies = dataset.filter(
        (user) =>
          user.userType === 'empresa' && user.registrationStatus !== 'APPROVED',
      );

      expect(notApprovedCompanies).toHaveLength(1);
      expect(
        (await service.getRegisteredUsers(query({ userType: 'empresa' })))
          .totalItems,
      ).toBe(0);
    });
  });

  describe('CA 15 y CA 16: integridad de los 6 campos por usuario', () => {
    const sourceById = new Map(dataset.map((user) => [user.id, user]));

    it('cada fila trae solo el id y los 6 campos del reporte', async () => {
      for (const user of (await collectAllPages(service)).flat()) {
        expect(Object.keys(user).sort()).toEqual(
          ['id', ...REQUIRED_FIELDS].sort(),
        );
      }
    });

    it('los 6 campos de cada fila pertenecen al mismo usuario', async () => {
      for (const user of (await collectAllPages(service)).flat()) {
        const source = sourceById.get(user.id);

        expect(source).toBeDefined();
        for (const field of REQUIRED_FIELDS) {
          expect(user[field]).toBe(source?.[field]);
        }
      }
    });

    it('ningún campo llega vacío', async () => {
      for (const user of (await collectAllPages(service, 'mentor')).flat()) {
        for (const field of REQUIRED_FIELDS) {
          expect(user[field]).toBeTruthy();
        }
      }
    });
  });

  describe('CA 22 y CA 23: sin duplicados ni omisiones entre páginas', () => {
    it.each([undefined, ...ROLE_NAMES])(
      'recorrer todas las páginas de %s devuelve cada usuario una sola vez',
      async (userType) => {
        const { totalItems } = await service.getRegisteredUsers(
          query({ userType }),
        );
        const ids = (await collectAllPages(service, userType))
          .flat()
          .map((user) => user.id);

        expect(ids).toHaveLength(totalItems);
        expect(new Set(ids).size).toBe(totalItems);
      },
    );

    it('con fechas idénticas desempata por id en orden ascendente', async () => {
      const ids = (await collectAllPages(service, 'titulado'))
        .flat()
        .map((user) => user.id);

      expect(ids).toEqual([...ids].sort((a, b) => a.localeCompare(b)));
      expect(ids).toEqual(
        dataset
          .filter(
            (user) =>
              user.userType === 'titulado' &&
              user.registrationStatus === 'APPROVED',
          )
          .map((user) => user.id)
          .sort((a, b) => a.localeCompare(b)),
      );
    });

    it('ordena del más reciente al más antiguo', async () => {
      const dates = (await collectAllPages(service, 'mentor'))
        .flat()
        .map((user) => new Date(user.registeredAt).getTime());

      expect(dates).toEqual([...dates].sort((a, b) => b - a));
    });

    it('el orden no depende del orden en que llegan los datos', async () => {
      const reversed = buildService([...dataset].reverse());

      expect(await collectAllPages(reversed, 'titulado')).toEqual(
        await collectAllPages(service, 'titulado'),
      );
      expect(await collectAllPages(reversed)).toEqual(
        await collectAllPages(service),
      );
    });

    it('consultas repetidas de la misma página devuelven lo mismo', async () => {
      const pageTwo = async () =>
        (
          await service.getRegisteredUsers(
            query({ userType: 'titulado', page: 2 }),
          )
        ).items;

      expect(await pageTwo()).toEqual(await pageTwo());
    });

    it('resiste un volumen alto de usuarios con la misma fecha', async () => {
      const users = Array.from({ length: 1_000 }, (_, index) => ({
        ...buildUser('mentor', index),
        registeredAt: SAME_REGISTRATION_DATE,
      }));
      const ids = (await collectAllPages(buildService(users), 'mentor'))
        .flat()
        .map((user) => user.id);

      expect(ids).toHaveLength(1_000);
      expect(new Set(ids).size).toBe(1_000);
    });
  });

  describe('Exportación CSV con el filtro de tipo de usuario', () => {
    it('"Todos" exporta lo mismo que omitir el filtro', async () => {
      const all = await service.exportRegisteredUsersCsv(
        registeredUsersFiltersSchema.parse({ userType: ALL_FILTER_VALUE }),
      );
      const omitted = await service.exportRegisteredUsersCsv(
        registeredUsersFiltersSchema.parse({}),
      );

      expect(all.content).toBe(omitted.content);
      expect(all.content.trim().split('\r\n')).toHaveLength(TOTAL_APPROVED + 1);
    });

    it('un tipo sin registros exporta solo la cabecera', async () => {
      const { content } = await service.exportRegisteredUsersCsv(
        registeredUsersFiltersSchema.parse({ userType: 'empresa' }),
      );

      expect(content.trim().split('\r\n')).toHaveLength(1);
    });
  });
});
