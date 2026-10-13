import type { PrismaService } from '../../../common/prisma/prisma.service.js';
import { ReportUsersRepository } from '../repositories/report-users.repository.js';
import { CSV_BOM } from '../../../common/utils/csv.js';
import {
  registeredUsersFiltersSchema,
  registeredUsersQuerySchema,
  rejectedUsersFiltersSchema,
  rejectedUsersQuerySchema,
} from '../requests/report-users.schema.js';
import { ReportsService } from '../services/reports.service.js';
import type { ReportUser } from '../types/report-user.types.js';

function buildUser(overrides: Partial<ReportUser>): ReportUser {
  return {
    id: 'user-1',
    fullName: 'Usuario de prueba',
    email: 'usuario@example.com',
    userType: 'titulado',
    identifier: 'ID-1',
    documentType: 'academic_diploma',
    registeredAt: '2026-01-01T00:00:00.000Z',
    registrationStatus: 'APPROVED',
    rejectionReason: null,
    ...overrides,
  };
}

const USERS: ReportUser[] = [
  buildUser({
    id: 'a',
    fullName: 'Ana Pérez',
    registeredAt: '2026-03-01T00:00:00.000Z',
  }),
  buildUser({
    id: 'b',
    fullName: 'Bruno Díaz',
    userType: 'empresa',
    registeredAt: '2026-05-01T00:00:00.000Z',
  }),
  buildUser({
    id: 'c',
    fullName: 'Carla Ríos',
    userType: 'administrativo',
    registeredAt: '2025-02-01T00:00:00.000Z',
  }),
  buildUser({
    id: 'e',
    fullName: 'Elena Soto',
    registrationStatus: 'REJECTED',
    rejectionReason: 'Sin documento',
  }),
  buildUser({
    id: 'f',
    fullName: 'Fabio León',
    registrationStatus: 'REJECTED',
    rejectionReason: 'Correo inválido',
    registeredAt: '2026-08-01T00:00:00.000Z',
  }),
];

function buildService(users: readonly ReportUser[] = USERS): ReportsService {
  const repository = new ReportUsersRepository({} as PrismaService);
  vi.spyOn(repository, 'findAll').mockResolvedValue([...users]);
  return new ReportsService(repository);
}

const registeredQuery = (input: Record<string, unknown> = {}) =>
  registeredUsersQuerySchema.parse(input);
const rejectedQuery = (input: Record<string, unknown> = {}) =>
  rejectedUsersQuerySchema.parse(input);

describe('ReportsService', () => {
  describe('exportRegisteredUsersCsv', () => {
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date('2026-10-03T15:00:00.000Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('exporta todos los aprobados sin paginar, del más reciente al más antiguo', async () => {
      const users = Array.from({ length: 15 }, (_, index) =>
        buildUser({ id: `user-${index}`, fullName: `Usuario ${index}` }),
      );

      const { content } = await buildService(users).exportRegisteredUsersCsv(
        registeredUsersFiltersSchema.parse({}),
      );

      expect(content.startsWith(CSV_BOM)).toBe(true);
      expect(content.trim().split('\r\n')).toHaveLength(16);
    });

    it('aplica los filtros y usa las etiquetas de la tabla', async () => {
      const { content } = await buildService().exportRegisteredUsersCsv(
        registeredUsersFiltersSchema.parse({ userType: 'empresa' }),
      );

      expect(content).toBe(
        `${CSV_BOM}Usuario,Correo,Tipo de Usuario,Identificador,Documento,Fecha de Registro\r\n` +
          'Bruno Díaz,usuario@example.com,Empresa,ID-1,Diploma académico,30/04/2026\r\n',
      );
    });

    it('termina el nombre del archivo en "todos" si no se filtró por gestión', async () => {
      const { fileName } = await buildService().exportRegisteredUsersCsv({});

      expect(fileName).toBe('usuarios-registrados-todos.csv');
    });

    it('agrega al nombre del archivo los filtros usados', async () => {
      const { fileName } = await buildService().exportRegisteredUsersCsv(
        registeredUsersFiltersSchema.parse({
          userType: 'estudiante',
          search: 'Ana Pérez',
        }),
      );

      expect(fileName).toBe(
        'usuarios-registrados-estudiante-ana-perez-todos.csv',
      );
    });

    it('termina el nombre del archivo en la gestión en vez de la fecha', async () => {
      const { fileName } = await buildService().exportRegisteredUsersCsv(
        registeredUsersFiltersSchema.parse({ period: 'II-2025' }),
      );

      expect(fileName).toBe('usuarios-registrados-II-2025.csv');
    });

    it('combina el tipo de usuario con la gestión', async () => {
      const { fileName } = await buildService().exportRegisteredUsersCsv(
        registeredUsersFiltersSchema.parse({
          userType: 'estudiante',
          period: 'I-2026',
        }),
      );

      expect(fileName).toBe('usuarios-registrados-estudiante-I-2026.csv');
    });
  });

  describe('exportRejectedUsersCsv', () => {
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date('2026-10-03T15:00:00.000Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('exporta solo rechazados, del más reciente al más antiguo', async () => {
      const { content } = await buildService().exportRejectedUsersCsv(
        rejectedUsersFiltersSchema.parse({}),
      );

      expect(content).toBe(
        `${CSV_BOM}Usuario,Correo,Identificador,Documento,Fecha de Registro\r\n` +
          'Fabio León,usuario@example.com,ID-1,Diploma académico,31/07/2026\r\n' +
          'Elena Soto,usuario@example.com,ID-1,Diploma académico,31/12/2025\r\n',
      );
    });

    it('aplica la búsqueda por correo', async () => {
      const users = [
        buildUser({
          id: 'x',
          fullName: 'Xavier Luna',
          email: 'xavier@example.com',
          registrationStatus: 'REJECTED',
        }),
        buildUser({
          id: 'y',
          fullName: 'Yola Mar',
          email: 'yola@example.com',
          registrationStatus: 'REJECTED',
        }),
      ];

      const { content } = await buildService(users).exportRejectedUsersCsv(
        rejectedUsersFiltersSchema.parse({ search: 'yola' }),
      );

      expect(content.trim().split('\r\n')).toHaveLength(2);
      expect(content).toContain('Yola Mar');
      expect(content).not.toContain('Xavier Luna');
    });

    it('nombra el archivo con la fecha de exportación', async () => {
      const { fileName } = await buildService().exportRejectedUsersCsv({});

      expect(fileName).toBe('usuarios-rechazados-2026-10-03.csv');
    });

    it('agrega al nombre del archivo lo que se buscó', async () => {
      const { fileName } = await buildService().exportRejectedUsersCsv(
        rejectedUsersFiltersSchema.parse({ search: ' Juan.Perez@gmail.com ' }),
      );

      expect(fileName).toBe(
        'usuarios-rechazados-juan.perez@gmail.com-2026-10-03.csv',
      );
    });
  });

  describe('getRegisteredUsers', () => {
    it('devuelve solo aprobados, del más reciente al más antiguo', async () => {
      const result = await buildService().getRegisteredUsers(registeredQuery());

      expect(result.items.map((user) => user.id)).toEqual(['b', 'a', 'c']);
      expect(result).toMatchObject({ totalItems: 3, page: 1, limit: 10 });
    });

    it('no expone el estado de registro ni el motivo de rechazo', async () => {
      const [user] = (
        await buildService().getRegisteredUsers(registeredQuery())
      ).items;

      expect(user).not.toHaveProperty('registrationStatus');
      expect(user).not.toHaveProperty('rejectionReason');
    });

    it.each([
      { userType: 'empresa', expectedId: 'b' },
      { userType: 'estudiante', expectedId: 'student-1' },
    ])(
      'filtra por tipo de usuario $userType',
      async ({ userType, expectedId }) => {
        const service = buildService([
          ...USERS,
          buildUser({ id: 'student-1', userType: 'estudiante' }),
        ]);
        const result = await service.getRegisteredUsers(
          registeredQuery({ userType }),
        );

        expect(result.items.map((user) => user.id)).toEqual([expectedId]);
      },
    );

    it.each([
      { period: 'I-2026', expectedIds: ['b', 'a'] },
      { period: 'I-2025', expectedIds: ['c'] },
      { period: 'II-2025', expectedIds: ['h'] },
      { period: 'II-2026', expectedIds: [] },
    ])('filtra por la gestión $period', async ({ period, expectedIds }) => {
      const service = buildService([
        ...USERS,
        buildUser({ id: 'h', registeredAt: '2025-08-10T00:00:00.000Z' }),
      ]);

      const result = await service.getRegisteredUsers(
        registeredQuery({ period }),
      );

      expect(result.items.map((user) => user.id)).toEqual(expectedIds);
    });

    it.each([
      'III-2025',
      '1-2025',
      '2-2025',
      'i-2025',
      'I2025',
      '2025',
      'I-25',
    ])('rechaza la gestión inválida %s', (period) => {
      expect(registeredUsersQuerySchema.safeParse({ period }).success).toBe(
        false,
      );
    });

    it('busca sin distinguir mayúsculas ni tildes', async () => {
      const result = await buildService().getRegisteredUsers(
        registeredQuery({ search: 'PEREZ' }),
      );

      expect(result.items.map((user) => user.id)).toEqual(['a']);
    });

    it('busca también por correo e identificador', async () => {
      const service = buildService([
        buildUser({
          id: 'x',
          email: 'unico@example.com',
          identifier: 'NIT-777',
        }),
        buildUser({ id: 'y' }),
      ]);

      expect(
        (
          await service.getRegisteredUsers(
            registeredQuery({ search: 'unico@' }),
          )
        ).items,
      ).toHaveLength(1);
      expect(
        (
          await service.getRegisteredUsers(
            registeredQuery({ search: 'nit-777' }),
          )
        ).items,
      ).toHaveLength(1);
    });

    it('pagina los resultados', async () => {
      const result = await buildService().getRegisteredUsers(
        registeredQuery({ page: '2', limit: '2' }),
      );

      expect(result.items.map((user) => user.id)).toEqual(['c']);
      expect(result).toMatchObject({ totalItems: 3, page: 2, limit: 2 });
    });
  });

  describe('getRejectedUsers', () => {
    it('devuelve solo rechazados con su documento y motivo', async () => {
      const result = await buildService().getRejectedUsers(rejectedQuery());

      expect(result.items.map((user) => user.id)).toEqual(['f', 'e']);
      expect(result.items[0]).toMatchObject({
        documentType: 'academic_diploma',
        rejectionReason: 'Correo inválido',
      });
      expect(result.items[0]).not.toHaveProperty('userType');
    });

    it('busca dentro de los rechazados por correo', async () => {
      const service = buildService([
        ...USERS,
        buildUser({
          id: 'g',
          email: 'juan.perez@gmail.com',
          registrationStatus: 'REJECTED',
        }),
      ]);

      const result = await service.getRejectedUsers(
        rejectedQuery({ search: 'juan.perez@' }),
      );

      expect(result.items.map((user) => user.id)).toEqual(['g']);
    });

    it('no busca por nombre ni por identificador', async () => {
      const service = buildService([
        buildUser({
          id: 'h',
          fullName: 'Hugo Pardo',
          email: 'contacto@example.com',
          identifier: 'NIT-555',
          registrationStatus: 'REJECTED',
        }),
      ]);

      expect(
        (await service.getRejectedUsers(rejectedQuery({ search: 'hugo' })))
          .items,
      ).toHaveLength(0);
      expect(
        (await service.getRejectedUsers(rejectedQuery({ search: 'nit-555' })))
          .items,
      ).toHaveLength(0);
      expect(
        (await service.getRejectedUsers(rejectedQuery({ search: 'contacto@' })))
          .items,
      ).toHaveLength(1);
    });
  });
});
