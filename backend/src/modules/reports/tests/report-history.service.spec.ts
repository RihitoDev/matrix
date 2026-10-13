import type { PrismaService } from '../../../common/prisma/prisma.service.js';
import { GeneratedReportsRepository } from '../repositories/generated-reports.repository.js';
import { reportHistoryQuerySchema } from '../requests/report-history.schema.js';
import { ReportHistoryService } from '../services/report-history.service.js';
import type { GeneratedReport } from '../types/generated-report.types.js';

const ADMIN_ID = 'admin-1';

function buildReport(overrides: Partial<GeneratedReport>): GeneratedReport {
  return {
    id: 'report-1',
    fileName: 'Reporte_De_Prueba',
    reportType: 'REGISTERED_USERS',
    generatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

const REPORTS: GeneratedReport[] = [
  buildReport({
    id: 'b',
    fileName: 'Rechazados_Mayo',
    reportType: 'REJECTED_USERS',
    generatedAt: '2026-05-01T10:00:00.000Z',
  }),
  buildReport({
    id: 'a',
    fileName: 'Lista_Usuarios_Marzo',
    generatedAt: '2026-03-01T10:00:00.000Z',
  }),
];

function buildService(
  reports: GeneratedReport[] = REPORTS,
  total = reports.length,
) {
  const repository = new GeneratedReportsRepository({} as PrismaService);
  const findPage = vi
    .spyOn(repository, 'findPage')
    .mockResolvedValue({ reports, total });
  const create = vi
    .spyOn(repository, 'create')
    .mockImplementation((_userId, input) =>
      Promise.resolve(buildReport({ ...input, id: 'nuevo' })),
    );

  return { service: new ReportHistoryService(repository), findPage, create };
}

const historyQuery = (input: Record<string, unknown> = {}) =>
  reportHistoryQuerySchema.parse(input);

describe('ReportHistoryService', () => {
  describe('getReportHistory', () => {
    it('devuelve los reportes en el orden que entrega el repositorio', async () => {
      const { service } = buildService();

      const result = await service.getReportHistory(historyQuery());

      expect(result.items.map((report) => report.id)).toEqual(['b', 'a']);
    });

    it('expone el nombre, el tipo y la fecha de generación de cada reporte (CA 2, 3, 4, 30, 31, 32)', async () => {
      const { service } = buildService();

      const [report] = (await service.getReportHistory(historyQuery())).items;

      expect(report).toEqual({
        id: 'b',
        fileName: 'Rechazados_Mayo',
        reportType: 'REJECTED_USERS',
        generatedAt: '2026-05-01T10:00:00.000Z',
      });
    });

    it('pide al repositorio solo la página solicitada (CA 22)', async () => {
      const { service, findPage } = buildService(REPORTS, 25);

      const result = await service.getReportHistory(
        historyQuery({ page: 3, limit: 10 }),
      );

      expect(findPage).toHaveBeenCalledWith(20, 10, undefined);
      expect(result).toMatchObject({
        totalItems: 25,
        totalPages: 3,
        page: 3,
        limit: 10,
      });
    });

    it('devuelve una lista vacía cuando no hay reportes', async () => {
      const { service } = buildService([], 0);

      const result = await service.getReportHistory(historyQuery());

      expect(result).toEqual({
        items: [],
        totalItems: 0,
        totalPages: 0,
        page: 1,
        limit: 10,
      });
    });
  });

  describe('filtro por tipo de reporte', () => {
    it('pide al repositorio solo los reportes del tipo indicado', async () => {
      const { service, findPage } = buildService();

      await service.getReportHistory(
        historyQuery({ reportType: 'REJECTED_USERS' }),
      );

      expect(findPage).toHaveBeenCalledWith(0, 10, 'REJECTED_USERS');
    });

    it.each([{}, { reportType: 'ALL' }])(
      'con "ALL" o sin filtro pide todos los tipos',
      async (input) => {
        const { service, findPage } = buildService();

        await service.getReportHistory(historyQuery(input));

        expect(findPage).toHaveBeenCalledWith(0, 10, undefined);
      },
    );

    it('rechaza un tipo de reporte que no existe', () => {
      expect(
        reportHistoryQuerySchema.safeParse({ reportType: 'GRADUATES' }).success,
      ).toBe(false);
    });
  });

  describe('registerGeneratedReport', () => {
    it('registra el reporte a nombre del usuario autenticado', async () => {
      const { service, create } = buildService();
      const input = {
        fileName: 'usuarios-registrados-todos.csv',
        reportType: 'REGISTERED_USERS' as const,
      };

      const report = await service.registerGeneratedReport(ADMIN_ID, input);

      expect(create).toHaveBeenCalledWith(ADMIN_ID, input);
      expect(report).toMatchObject(input);
    });
  });
});
