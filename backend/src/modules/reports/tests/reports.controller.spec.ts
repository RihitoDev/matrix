import { StreamableFile } from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants.js';
import { Test, type TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
import { ROLES_KEY } from '../../../common/constants/roles.constants.js';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../../common/guards/roles.guard.js';
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
        { provide: PrismaService, useValue: {} },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = moduleRef.get(ReportsController);
    service = moduleRef.get(ReportsService);
    historyService = moduleRef.get(ReportHistoryService);
  });

  it('exige sesión con rol administrativo en todos los endpoints', () => {
    expect(Reflect.getMetadata(GUARDS_METADATA, ReportsController)).toEqual([
      JwtAuthGuard,
      RolesGuard,
    ]);
    expect(Reflect.getMetadata(ROLES_KEY, ReportsController)).toEqual([
      'administrativo',
    ]);
  });

  it('delega el reporte de registrados al service', async () => {
    const query = { page: 1, limit: 10 };
    const spy = vi
      .spyOn(service, 'getRegisteredUsers')
      .mockResolvedValue({ items: [], totalItems: 0, totalPages: 0, ...query });

    const result = await controller.getRegisteredUsers(query);

    expect(spy).toHaveBeenCalledWith(query);
    expect(result.page).toBe(1);
  });

  it('devuelve el CSV de registrados como archivo descargable', async () => {
    const filters = { userType: 'empresa' as const };
    const spy = vi
      .spyOn(service, 'exportRegisteredUsersCsv')
      .mockResolvedValue({
        fileName: 'usuarios-registrados-1-2026.csv',
        content: 'Usuario\r\n',
      });

    vi.spyOn(historyService, 'registerGeneratedReport').mockResolvedValue({
      id: 'r',
      fileName: 'f',
      reportType: 'REGISTERED_USERS',
      generatedAt: '',
    });

    const file = await controller.exportRegisteredUsersCsv(filters, 'admin-1');

    expect(spy).toHaveBeenCalledWith(filters);
    expect(file).toBeInstanceOf(StreamableFile);
    expect(file.getHeaders()).toMatchObject({
      type: 'text/csv; charset=utf-8',
      disposition: 'attachment; filename="usuarios-registrados-1-2026.csv"',
    });
  });

  it.each([
    [undefined, 'REGISTERED_USERS'],
    ['estudiante', 'STUDENTS'],
    ['titulado', 'DEGREE_HOLDERS'],
    ['mentor', 'MENTORS'],
    ['empresa', 'COMPANIES'],
    ['administrativo', 'ADMINS'],
  ] as const)(
    'registra en el historial la exportación de registrados con filtro %s como %s',
    async (userType, reportType) => {
      vi.spyOn(service, 'exportRegisteredUsersCsv').mockResolvedValue({
        fileName: 'usuarios-registrados.csv',
        content: 'Usuario\r\n',
      });
      const spy = vi
        .spyOn(historyService, 'registerGeneratedReport')
        .mockResolvedValue({
          id: 'r',
          fileName: 'usuarios-registrados.csv',
          reportType,
          generatedAt: '',
        });

      await controller.exportRegisteredUsersCsv({ userType }, 'admin-1');

      expect(spy).toHaveBeenCalledWith('admin-1', {
        fileName: 'usuarios-registrados.csv',
        reportType,
      });
    },
  );

  it('registra en el historial la exportación de rechazados como REJECTED_USERS', async () => {
    vi.spyOn(service, 'exportRejectedUsersCsv').mockResolvedValue({
      fileName: 'usuarios-rechazados-2026-10-08.csv',
      content: 'Usuario\r\n',
    });
    const spy = vi
      .spyOn(historyService, 'registerGeneratedReport')
      .mockResolvedValue({
        id: 'r',
        fileName: 'usuarios-rechazados-2026-10-08.csv',
        reportType: 'REJECTED_USERS',
        generatedAt: '',
      });

    await controller.exportRejectedUsersCsv({}, 'admin-1');

    expect(spy).toHaveBeenCalledWith('admin-1', {
      fileName: 'usuarios-rechazados-2026-10-08.csv',
      reportType: 'REJECTED_USERS',
    });
  });

  it('delega el reporte de rechazados al service', async () => {
    const query = { page: 1, limit: 10 };
    const spy = vi
      .spyOn(service, 'getRejectedUsers')
      .mockResolvedValue({ items: [], totalItems: 0, totalPages: 0, ...query });

    const result = await controller.getRejectedUsers(query);

    expect(spy).toHaveBeenCalledWith(query);
    expect(result).toEqual({
      items: [],
      totalItems: 0,
      totalPages: 0,
      page: 1,
      limit: 10,
    });
  });

  it('devuelve el CSV de rechazados como archivo descargable', async () => {
    const filters = { search: 'correo' };
    const spy = vi.spyOn(service, 'exportRejectedUsersCsv').mockResolvedValue({
      fileName: 'usuarios-rechazados-2026-10-03.csv',
      content: 'Usuario\r\n',
    });

    vi.spyOn(historyService, 'registerGeneratedReport').mockResolvedValue({
      id: 'r',
      fileName: 'f',
      reportType: 'REGISTERED_USERS',
      generatedAt: '',
    });

    const file = await controller.exportRejectedUsersCsv(filters, 'admin-1');

    expect(spy).toHaveBeenCalledWith(filters);
    expect(file).toBeInstanceOf(StreamableFile);
    expect(file.getHeaders()).toMatchObject({
      type: 'text/csv; charset=utf-8',
      disposition: 'attachment; filename="usuarios-rechazados-2026-10-03.csv"',
    });
  });

  it('delega el historial de reportes al service', async () => {
    const query = { page: 1, limit: 10 };
    const spy = vi
      .spyOn(historyService, 'getReportHistory')
      .mockResolvedValue({ items: [], totalItems: 0, totalPages: 0, ...query });

    const result = await controller.getReportHistory(query);

    expect(spy).toHaveBeenCalledWith(query);
    expect(result).toEqual({
      items: [],
      totalItems: 0,
      totalPages: 0,
      page: 1,
      limit: 10,
    });
  });
});
