import type { PrismaService } from '../../../common/prisma/prisma.service.js';
import { GeneratedReportsRepository } from '../repositories/generated-reports.repository.js';
import { REPORT_TYPES } from '../types/generated-report.types.js';

const CREATED_AT = new Date('2026-05-01T10:00:00.000Z');

const RECORD = {
  userId: 'admin-1',
  createdAt: CREATED_AT,
  reportName: 'usuarios-rechazados-2026-05-01.csv',
  reportType: 'REJECTED_USERS',
};

function buildRepository() {
  const adminExportHistory = {
    findMany: vi.fn().mockResolvedValue([RECORD]),
    count: vi.fn().mockResolvedValue(1),
    create: vi.fn().mockResolvedValue(RECORD),
  };
  const repository = new GeneratedReportsRepository({
    adminExportHistory,
  } as unknown as PrismaService);

  return { repository, adminExportHistory };
}

describe('GeneratedReportsRepository', () => {
  describe('findPage', () => {
    it('muestra únicamente reportes de tipos que la plataforma genera (CA 25)', async () => {
      const { repository, adminExportHistory } = buildRepository();

      await repository.findPage(0, 10);

      const where = { reportType: { in: [...REPORT_TYPES] } };
      expect(adminExportHistory.findMany).toHaveBeenCalledWith({
        where,
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
      });
      expect(adminExportHistory.count).toHaveBeenCalledWith({ where });
    });

    it('filtra por el tipo de reporte indicado', async () => {
      const { repository, adminExportHistory } = buildRepository();

      const page = await repository.findPage(10, 10, 'REJECTED_USERS');

      expect(adminExportHistory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { reportType: 'REJECTED_USERS' } }),
      );
      expect(page).toEqual({
        reports: [
          {
            id: `admin-1_${CREATED_AT.getTime()}`,
            fileName: RECORD.reportName,
            reportType: 'REJECTED_USERS',
            generatedAt: CREATED_AT.toISOString(),
          },
        ],
        total: 1,
      });
    });
  });

  describe('create', () => {
    it('guarda el reporte en la BD a nombre del usuario autenticado', async () => {
      const { repository, adminExportHistory } = buildRepository();

      await repository.create('admin-1', {
        fileName: RECORD.reportName,
        reportType: 'REJECTED_USERS',
      });

      expect(adminExportHistory.create).toHaveBeenCalledWith({
        data: {
          userId: 'admin-1',
          reportName: RECORD.reportName,
          reportType: 'REJECTED_USERS',
        },
      });
    });
  });
});
