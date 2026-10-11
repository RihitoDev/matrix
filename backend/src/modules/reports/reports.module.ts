import { Module } from '@nestjs/common';
import { ReportsController } from './controllers/reports.controller.js';
import { GeneratedReportsRepository } from './repositories/generated-reports.repository.js';
import { ReportUsersRepository } from './repositories/report-users.repository.js';
import { ReportHistoryService } from './services/report-history.service.js';
import { ReportsService } from './services/reports.service.js';

@Module({
  controllers: [ReportsController],
  providers: [
    ReportsService,
    ReportUsersRepository,
    ReportHistoryService,
    GeneratedReportsRepository,
  ],
})
export class ReportsModule {}
