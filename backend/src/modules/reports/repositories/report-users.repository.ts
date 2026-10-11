import { Injectable } from '@nestjs/common';
import type { ReportUser } from '../types/report-user.types.js';

@Injectable()
export class ReportUsersRepository {
  findAll(): readonly ReportUser[] {
    return [];
  }
}
