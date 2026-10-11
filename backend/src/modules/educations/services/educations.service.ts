import { Injectable } from '@nestjs/common';
import { EducationNotFoundException } from '../exceptions/education-not-found.exception.js';
import { EducationUpdateConflictException } from '../exceptions/education-update-conflict.exception.js';
import { InvalidEducationDateRangeException } from '../exceptions/invalid-education-date-range.exception.js';
import { EducationMapper } from '../mappers/education.mapper.js';
import { EducationsRepository } from '../repositories/educations.repository.js';
import type { CreateEducationRequest } from '../requests/create-education.request.js';
import type { UpdateEducationRequest } from '../requests/update-education.request.js';
import type { EducationResponse } from '../responses/education.response.js';

@Injectable()
export class EducationsService {
  constructor(
    private readonly repository: EducationsRepository,
    private readonly mapper: EducationMapper,
  ) {}

  async findAll(userId: string): Promise<EducationResponse[]> {
    return this.mapper.toResponseList(
      await this.repository.findManyByUserId(userId),
    );
  }

  async create(
    userId: string,
    request: CreateEducationRequest,
  ): Promise<EducationResponse> {
    this.validateDateRange(request.startDate, request.endDate);
    return this.mapper.toResponse(
      await this.repository.create(userId, request),
    );
  }

  async update(
    userId: string,
    id: string,
    request: UpdateEducationRequest,
  ): Promise<EducationResponse> {
    const record = await this.repository.findByIdAndUserId(id, userId);
    if (!record) {
      throw new EducationNotFoundException();
    }

    this.validateDateRange(
      request.startDate ?? record.startDate,
      request.endDate === undefined ? record.endDate : request.endDate,
    );
    const updated = await this.repository.update(id, userId, request, {
      startDate: record.startDate,
      endDate: record.endDate,
    });
    if (!updated) {
      if (!(await this.repository.findByIdAndUserId(id, userId))) {
        throw new EducationNotFoundException();
      }
      throw new EducationUpdateConflictException();
    }
    return this.mapper.toResponse(updated);
  }

  async remove(userId: string, id: string): Promise<void> {
    const deleted = await this.repository.delete(id, userId);
    if (!deleted) {
      throw new EducationNotFoundException();
    }
  }

  private validateDateRange(
    startDate: Date,
    endDate: Date | null | undefined,
  ): void {
    if (endDate && endDate.getTime() < startDate.getTime()) {
      throw new InvalidEducationDateRangeException();
    }
  }
}
