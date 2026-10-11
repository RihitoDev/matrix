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
    userType: 'DEGREE_HOLDER',
    identifier: 'ID-1',
    documentType: 'ACADEMIC_DEGREE',
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
    userType: 'COMPANY',
    registeredAt: '2026-05-01T00:00:00.000Z',
  }),
  buildUser({
    id: 'c',
    fullName: 'Carla Ríos',
    userType: 'ADMIN',
    registeredAt: '2025-02-01T00:00:00.000Z',
  }),
  buildUser({ id: 'd', fullName: 'Dario Paz', registrationStatus: 'PENDING' }),
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
  const repository = new ReportUsersRepository();
  vi.spyOn(repository, 'findAll').mockReturnValue(users);
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

    it('exporta todos los aprobados sin paginar, del más reciente al más antiguo', () => {
      const users = Array.from({ length: 15 }, (_, index) =>
        buildUser({ id: `user-${index}`, fullName: `Usuario ${index}` }),
      );

      const { content } = buildService(users).exportRegisteredUsersCsv(
        registeredUsersFiltersSchema.parse({}),
      );

      expect(content.startsWith(CSV_BOM)).toBe(true);
      expect(content.trim().split('\r\n')).toHaveLength(16);
    });

    it('aplica los filtros y usa las etiquetas de la tabla', () => {
      const { content } = buildService().exportRegisteredUsersCsv(
        registeredUsersFiltersSchema.parse({ userType: 'COMPANY' }),
      );

      expect(content).toBe(
        `${CSV_BOM}Usuario,Correo,Tipo de Usuario,Identificador,Documento,Fecha de Registro\r\n` +
          'Bruno Díaz,usuario@example.com,Empresa,ID-1,Título académico,30/04/2026\r\n',
      );
    });

    it('nombra el archivo con la fecha de exportación', () => {
      const { fileName } = buildService().exportRegisteredUsersCsv({});

      expect(fileName).toBe('usuarios-registrados-2026-10-03.csv');
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

    it('exporta solo rechazados, del más reciente al más antiguo', () => {
      const { content } = buildService().exportRejectedUsersCsv(
        rejectedUsersFiltersSchema.parse({}),
      );

      expect(content).toBe(
        `${CSV_BOM}Usuario,Correo,Identificador,Documento,Fecha de Registro\r\n` +
          'Fabio León,usuario@example.com,ID-1,Título académico,31/07/2026\r\n' +
          'Elena Soto,usuario@example.com,ID-1,Título académico,31/12/2025\r\n',
      );
    });

    it('aplica la búsqueda por correo', () => {
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

      const { content } = buildService(users).exportRejectedUsersCsv(
        rejectedUsersFiltersSchema.parse({ search: 'yola' }),
      );

      expect(content.trim().split('\r\n')).toHaveLength(2);
      expect(content).toContain('Yola Mar');
      expect(content).not.toContain('Xavier Luna');
    });

    it('nombra el archivo con la fecha de exportación', () => {
      const { fileName } = buildService().exportRejectedUsersCsv({});

      expect(fileName).toBe('usuarios-rechazados-2026-10-03.csv');
    });
  });

  describe('getRegisteredUsers', () => {
    it('devuelve solo aprobados, del más reciente al más antiguo', () => {
      const result = buildService().getRegisteredUsers(registeredQuery());

      expect(result.items.map((user) => user.id)).toEqual(['b', 'a', 'c']);
      expect(result).toMatchObject({ totalItems: 3, page: 1, limit: 10 });
    });

    it('no expone el estado de registro ni el motivo de rechazo', () => {
      const [user] = buildService().getRegisteredUsers(registeredQuery()).items;

      expect(user).not.toHaveProperty('registrationStatus');
      expect(user).not.toHaveProperty('rejectionReason');
    });

    it.each([
      { userType: 'COMPANY', expectedId: 'b' },
      { userType: 'STUDENT', expectedId: 'student-1' },
    ])('filtra por tipo de usuario $userType', ({ userType, expectedId }) => {
      const service = buildService([
        ...USERS,
        buildUser({ id: 'student-1', userType: 'STUDENT' }),
      ]);
      const result = service.getRegisteredUsers(registeredQuery({ userType }));

      expect(result.items.map((user) => user.id)).toEqual([expectedId]);
    });

    it('filtra por gestión', () => {
      const result = buildService().getRegisteredUsers(
        registeredQuery({ year: '2025' }),
      );

      expect(result.items.map((user) => user.id)).toEqual(['c']);
    });

    it('busca sin distinguir mayúsculas ni tildes', () => {
      const result = buildService().getRegisteredUsers(
        registeredQuery({ search: 'PEREZ' }),
      );

      expect(result.items.map((user) => user.id)).toEqual(['a']);
    });

    it('busca también por correo e identificador', () => {
      const service = buildService([
        buildUser({
          id: 'x',
          email: 'unico@example.com',
          identifier: 'NIT-777',
        }),
        buildUser({ id: 'y' }),
      ]);

      expect(
        service.getRegisteredUsers(registeredQuery({ search: 'unico@' })).items,
      ).toHaveLength(1);
      expect(
        service.getRegisteredUsers(registeredQuery({ search: 'nit-777' }))
          .items,
      ).toHaveLength(1);
    });

    it('pagina los resultados', () => {
      const result = buildService().getRegisteredUsers(
        registeredQuery({ page: '2', limit: '2' }),
      );

      expect(result.items.map((user) => user.id)).toEqual(['c']);
      expect(result).toMatchObject({ totalItems: 3, page: 2, limit: 2 });
    });
  });

  describe('getRejectedUsers', () => {
    it('devuelve solo rechazados con su documento y motivo', () => {
      const result = buildService().getRejectedUsers(rejectedQuery());

      expect(result.items.map((user) => user.id)).toEqual(['f', 'e']);
      expect(result.items[0]).toMatchObject({
        documentType: 'ACADEMIC_DEGREE',
        rejectionReason: 'Correo inválido',
      });
      expect(result.items[0]).not.toHaveProperty('userType');
    });

    it('busca dentro de los rechazados por correo', () => {
      const service = buildService([
        ...USERS,
        buildUser({
          id: 'g',
          email: 'juan.perez@gmail.com',
          registrationStatus: 'REJECTED',
        }),
      ]);

      const result = service.getRejectedUsers(
        rejectedQuery({ search: 'juan.perez@' }),
      );

      expect(result.items.map((user) => user.id)).toEqual(['g']);
    });

    it('no busca por nombre ni por identificador', () => {
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
        service.getRejectedUsers(rejectedQuery({ search: 'hugo' })).items,
      ).toHaveLength(0);
      expect(
        service.getRejectedUsers(rejectedQuery({ search: 'nit-555' })).items,
      ).toHaveLength(0);
      expect(
        service.getRejectedUsers(rejectedQuery({ search: 'contacto@' })).items,
      ).toHaveLength(1);
    });
  });

  it('el repositorio por defecto no tiene usuarios', () => {
    const service = new ReportsService(new ReportUsersRepository());

    const registered = service.getRegisteredUsers(registeredQuery());
    const rejected = service.getRejectedUsers(rejectedQuery());

    expect(registered.totalItems).toBe(0);
    expect(rejected.totalItems).toBe(0);
  });
});
