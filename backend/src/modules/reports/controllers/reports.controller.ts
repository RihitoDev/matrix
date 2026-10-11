import {
  Controller,
  Get,
  Query,
  StreamableFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiProduces, ApiTags } from '@nestjs/swagger';
import { ResponseInterceptor } from '../../../common/interceptors/index.js';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe.js';
import {
  registeredUsersFiltersSchema,
  registeredUsersQuerySchema,
  rejectedUsersFiltersSchema,
  rejectedUsersQuerySchema,
  type RegisteredUsersFilters,
  type RegisteredUsersQuery,
  type RejectedUsersFilters,
  type RejectedUsersQuery,
} from '../requests/report-users.schema.js';
import {
  reportHistoryQuerySchema,
  type ReportHistoryQuery,
} from '../requests/report-history.schema.js';
import { ReportHistoryService } from '../services/report-history.service.js';
import { ReportsService } from '../services/reports.service.js';
import type { ReportCsvFile } from '../types/report-user.types.js';

function toCsvFile({ fileName, content }: ReportCsvFile): StreamableFile {
  return new StreamableFile(Buffer.from(content, 'utf-8'), {
    type: 'text/csv; charset=utf-8',
    disposition: `attachment; filename="${fileName}"`,
  });
}

@ApiTags('Reportes')
@Controller('reports')
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly reportHistoryService: ReportHistoryService,
  ) {}

  @Get('registered-users')
  @UseInterceptors(ResponseInterceptor)
  getRegisteredUsers(
    @Query(new ZodValidationPipe(registeredUsersQuerySchema))
    query: RegisteredUsersQuery,
  ) {
    return this.reportsService.getRegisteredUsers(query);
  }

  @Get('registered-users/export')
  @ApiProduces('text/csv')
  exportRegisteredUsersCsv(
    @Query(new ZodValidationPipe(registeredUsersFiltersSchema))
    filters: RegisteredUsersFilters,
  ): StreamableFile {
    return toCsvFile(this.reportsService.exportRegisteredUsersCsv(filters));
  }

  @Get('rejected-users')
  @UseInterceptors(ResponseInterceptor)
  getRejectedUsers(
    @Query(new ZodValidationPipe(rejectedUsersQuerySchema))
    query: RejectedUsersQuery,
  ) {
    return this.reportsService.getRejectedUsers(query);
  }

  @Get('rejected-users/export')
  @ApiProduces('text/csv')
  exportRejectedUsersCsv(
    @Query(new ZodValidationPipe(rejectedUsersFiltersSchema))
    filters: RejectedUsersFilters,
  ): StreamableFile {
    return toCsvFile(this.reportsService.exportRejectedUsersCsv(filters));
  }

  @Get('history')
  @UseInterceptors(ResponseInterceptor)
  getReportHistory(
    @Query(new ZodValidationPipe(reportHistoryQuerySchema))
    query: ReportHistoryQuery,
  ) {
    return this.reportHistoryService.getReportHistory(query);
  }
}
