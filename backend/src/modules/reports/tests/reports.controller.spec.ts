import { StreamableFile } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { ReportsController } from '../controllers/reports.controller.js';
import { GeneratedReportsRepository } from '../repositories/generated-reports.repository.js';
import { ReportUsersRepository } from '../repositories/report-users.repository.js';
import { ReportHistoryService } from '../services/report-history.service.js';
import { ReportsService } from '../services/reports.service.js';

describe('ReportsController', () => {
  let controller: ReportsController;
  let service: ReportsService;
  let historyService: ReportHistoryService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        ReportsService,
        ReportUsersRepository,
        ReportHistoryService,
        GeneratedReportsRepository,
      ],
    }).compile();

    controller = moduleRef.get(ReportsController);
    service = moduleRef.get(ReportsService);
    historyService = moduleRef.get(ReportHistoryService);
  });

  it('delega el reporte de registrados al service', () => {
    const query = { page: 1, limit: 10 };
    const spy = vi.spyOn(service, 'getRegisteredUsers');

    const result = controller.getRegisteredUsers(query);

    expect(spy).toHaveBeenCalledWith(query);
    expect(result.page).toBe(1);
  });

  it('devuelve el CSV de registrados como archivo descargable', () => {
    const filters = { userType: 'COMPANY' as const };
    const spy = vi.spyOn(service, 'exportRegisteredUsersCsv').mockReturnValue({
      fileName: 'usuarios-registrados-2026-10-03.csv',
      content: 'Usuario\r\n',
    });

    const file = controller.exportRegisteredUsersCsv(filters);

    expect(spy).toHaveBeenCalledWith(filters);
    expect(file).toBeInstanceOf(StreamableFile);
    expect(file.getHeaders()).toMatchObject({
      type: 'text/csv; charset=utf-8',
      disposition: 'attachment; filename="usuarios-registrados-2026-10-03.csv"',
    });
  });

  it('delega el reporte de rechazados al service', () => {
    const query = { page: 1, limit: 10 };
    const spy = vi.spyOn(service, 'getRejectedUsers');

    const result = controller.getRejectedUsers(query);

    expect(spy).toHaveBeenCalledWith(query);
    expect(result).toEqual({ items: [], totalItems: 0, page: 1, limit: 10 });
  });

  it('devuelve el CSV de rechazados como archivo descargable', () => {
    const filters = { search: 'correo' };
    const spy = vi.spyOn(service, 'exportRejectedUsersCsv').mockReturnValue({
      fileName: 'usuarios-rechazados-2026-10-03.csv',
      content: 'Usuario\r\n',
    });

    const file = controller.exportRejectedUsersCsv(filters);

    expect(spy).toHaveBeenCalledWith(filters);
    expect(file).toBeInstanceOf(StreamableFile);
    expect(file.getHeaders()).toMatchObject({
      type: 'text/csv; charset=utf-8',
      disposition: 'attachment; filename="usuarios-rechazados-2026-10-03.csv"',
    });
  });

  it('delega el historial de reportes al service', () => {
    const query = { page: 1, limit: 10 };
    const spy = vi.spyOn(historyService, 'getReportHistory');

    const result = controller.getReportHistory(query);

    expect(spy).toHaveBeenCalledWith(query);
    expect(result).toEqual({ items: [], totalItems: 0, page: 1, limit: 10 });
  });
});
