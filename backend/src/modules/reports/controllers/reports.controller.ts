import {
  Controller,
  Get,
  Query,
  StreamableFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiProduces, ApiTags } from '@nestjs/swagger';
import { CurrentUserId } from '../../../common/decorators/current-user-id.decorator.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../../common/guards/roles.guard.js';
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
import { REPORTS_ROLE } from '../constants/reports-access.constants.js';
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
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(REPORTS_ROLE)
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
  async exportRegisteredUsersCsv(
    @Query(new ZodValidationPipe(registeredUsersFiltersSchema))
    filters: RegisteredUsersFilters,
    @CurrentUserId() userId: string,
  ): Promise<StreamableFile> {
    const file = await this.reportsService.exportRegisteredUsersCsv(filters);
    await this.reportHistoryService.registerGeneratedReport(userId, {
      fileName: file.fileName,
      reportType: 'REGISTERED_USERS',
    });
    return toCsvFile(file);
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
  async exportRejectedUsersCsv(
    @Query(new ZodValidationPipe(rejectedUsersFiltersSchema))
    filters: RejectedUsersFilters,
    @CurrentUserId() userId: string,
  ): Promise<StreamableFile> {
    const file = await this.reportsService.exportRejectedUsersCsv(filters);
    await this.reportHistoryService.registerGeneratedReport(userId, {
      fileName: file.fileName,
      reportType: 'REJECTED_USERS',
    });
    return toCsvFile(file);
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
