import { GeneratedReportsRepository } from '../repositories/generated-reports.repository.js';
import { reportHistoryQuerySchema } from '../requests/report-history.schema.js';
import { ReportHistoryService } from '../services/report-history.service.js';
import type { GeneratedReport } from '../types/generated-report.types.js';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

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
    id: 'a',
    fileName: 'Lista_Usuarios_Marzo',
    generatedAt: '2026-03-01T10:00:00.000Z',
  }),
  buildReport({
    id: 'b',
    fileName: 'Rechazados_Mayo',
    reportType: 'REJECTED_USERS',
    generatedAt: '2026-05-01T10:00:00.000Z',
  }),
  buildReport({
    id: 'c',
    fileName: 'Egresados_2025',
    reportType: 'GRADUATES',
    generatedAt: '2025-02-01T10:00:00.000Z',
  }),
];

function buildService(
  reports: readonly GeneratedReport[] = REPORTS,
): ReportHistoryService {
  const repository = new GeneratedReportsRepository();
  vi.spyOn(repository, 'findAll').mockReturnValue(reports);
  return new ReportHistoryService(repository);
}

function buildServiceWithStorage(): ReportHistoryService {
  return new ReportHistoryService(new GeneratedReportsRepository());
}

const historyQuery = (input: Record<string, unknown> = {}) =>
  reportHistoryQuerySchema.parse(input);

describe('ReportHistoryService', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getReportHistory', () => {
    it('devuelve los reportes del más reciente al más antiguo', () => {
      const result = buildService().getReportHistory(historyQuery());

      expect(result.items.map((report) => report.id)).toEqual(['b', 'a', 'c']);
      expect(result).toMatchObject({ totalItems: 3, page: 1, limit: 10 });
    });

    it('expone el nombre, el tipo y la fecha de generación de cada reporte (CA 2, 3, 4, 30, 31, 32)', () => {
      const [report] = buildService().getReportHistory(historyQuery()).items;

      expect(report).toEqual({
        id: 'b',
        fileName: 'Rechazados_Mayo',
        reportType: 'REJECTED_USERS',
        generatedAt: '2026-05-01T10:00:00.000Z',
      });
    });

    it('mantiene juntos el nombre, el tipo y la fecha de cada reporte (CA 6, 7, 8, 16, 25, 33)', () => {
      const result = buildService().getReportHistory(historyQuery());

      result.items.forEach((report) => {
        expect(report).toEqual(REPORTS.find(({ id }) => id === report.id));
      });
    });

    it('consolida reportes de distintos tipos en el mismo historial (CA 17)', () => {
      const result = buildService().getReportHistory(historyQuery());

      expect(new Set(result.items.map((report) => report.reportType))).toEqual(
        new Set(['REGISTERED_USERS', 'REJECTED_USERS', 'GRADUATES']),
      );
    });

    it('conserva la fecha y hora de generación sin alterarlas (CA 23, 24)', () => {
      const sameDay = [
        buildReport({ id: 'morning', generatedAt: '2026-06-10T12:05:00.000Z' }),
        buildReport({ id: 'night', generatedAt: '2026-06-10T23:59:00.000Z' }),
      ];

      const result = buildService(sameDay).getReportHistory(historyQuery());

      expect(
        result.items.map(({ id, generatedAt }) => ({ id, generatedAt })),
      ).toEqual([
        { id: 'night', generatedAt: '2026-06-10T23:59:00.000Z' },
        { id: 'morning', generatedAt: '2026-06-10T12:05:00.000Z' },
      ]);
    });

    it('no modifica el orden de los datos del repositorio', () => {
      const reports = [...REPORTS];

      buildService(reports).getReportHistory(historyQuery());

      expect(reports.map((report) => report.id)).toEqual(['a', 'b', 'c']);
    });

    it('pagina los resultados (CA 22)', () => {
      const result = buildService().getReportHistory(
        historyQuery({ page: '2', limit: '2' }),
      );

      expect(result.items.map((report) => report.id)).toEqual(['c']);
      expect(result).toMatchObject({ totalItems: 3, page: 2, limit: 2 });
    });

    it('devuelve una lista vacía cuando no hay reportes', () => {
      const result = buildService([]).getReportHistory(historyQuery());

      expect(result).toEqual({ items: [], totalItems: 0, page: 1, limit: 10 });
    });

    it('el repositorio empieza sin reportes', () => {
      const result = buildServiceWithStorage().getReportHistory(historyQuery());

      expect(result.totalItems).toBe(0);
    });
  });

  describe('registerGeneratedReport', () => {
    it('registra el reporte con un id propio y la fecha y hora del servidor', () => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date('2026-10-03T15:30:00.000Z'));

      const report = buildServiceWithStorage().registerGeneratedReport({
        fileName: 'Lista_Usuarios_Octubre',
        reportType: 'REGISTERED_USERS',
      });

      expect(report).toEqual({
        id: expect.stringMatching(UUID_PATTERN),
        fileName: 'Lista_Usuarios_Octubre',
        reportType: 'REGISTERED_USERS',
        generatedAt: '2026-10-03T15:30:00.000Z',
      });
    });

    it('muestra el reporte registrado al inicio del historial (CA 5, 9)', () => {
      const service = buildServiceWithStorage();

      const report = service.registerGeneratedReport({
        fileName: 'Rechazados_Octubre',
        reportType: 'REJECTED_USERS',
      });
      const result = service.getReportHistory(historyQuery());

      expect(result.totalItems).toBe(1);
      expect(result.items[0]).toEqual(report);
    });

    it('registra como independientes los reportes generados en distintos momentos (CA 18, 34)', () => {
      vi.useFakeTimers({ toFake: ['Date'] });
      const service = buildServiceWithStorage();

      vi.setSystemTime(new Date('2026-10-03T09:00:00.000Z'));
      const first = service.registerGeneratedReport({
        fileName: 'Egresados_Manana',
        reportType: 'GRADUATES',
      });
      vi.setSystemTime(new Date('2026-10-03T18:00:00.000Z'));
      const second = service.registerGeneratedReport({
        fileName: 'Egresados_Tarde',
        reportType: 'GRADUATES',
      });

      const [newest, previous] = service.getReportHistory(historyQuery()).items;

      expect(first.id).not.toBe(second.id);
      expect(newest).toEqual(second);
      expect(previous).toEqual(first);
    });

    it('registra varios reportes generados al mismo tiempo sin que colisionen (CA 35)', async () => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date('2026-10-03T12:00:00.000Z'));
      const service = buildServiceWithStorage();
      const inputs = [
        { fileName: 'Lista_Usuarios_A', reportType: 'REGISTERED_USERS' },
        { fileName: 'Rechazados_B', reportType: 'REJECTED_USERS' },
        { fileName: 'Egresados_C', reportType: 'GRADUATES' },
      ] as const;

      const registered = await Promise.all(
        inputs.map(async (input) => service.registerGeneratedReport(input)),
      );
      const history = service.getReportHistory(historyQuery({ limit: '100' }));

      expect(new Set(registered.map((report) => report.id)).size).toBe(3);
      expect(history.totalItems).toBe(3);
      registered.forEach((report, index) => {
        expect(report).toMatchObject(inputs[index]);
        expect(history.items).toContainEqual(report);
      });
    });

    it('no comparte registros entre instancias', () => {
      buildServiceWithStorage().registerGeneratedReport({
        fileName: 'Temporal',
        reportType: 'GRADUATES',
      });

      const result = buildServiceWithStorage().getReportHistory(historyQuery());

      expect(result.totalItems).toBe(0);
    });
  });
});
