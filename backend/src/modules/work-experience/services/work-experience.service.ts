import { Injectable } from '@nestjs/common';
import { InvalidWorkExperienceDateRangeException } from '../exceptions/invalid-work-experience-date-range.exception.js';
import { WorkExperienceEndDateRequiredException } from '../exceptions/work-experience-end-date-required.exception.js';
import { WorkExperienceNotFoundException } from '../exceptions/work-experience-not-found.exception.js';
import { WorkExperienceUpdateConflictException } from '../exceptions/work-experience-update-conflict.exception.js';
import { WorkExperienceMapper } from '../mappers/work-experience.mapper.js';
import { WorkExperienceRepository } from '../repositories/work-experience.repository.js';
import type { CreateWorkExperienceRequest } from '../requests/create-work-experience.request.js';
import type { UpdateWorkExperienceRequest } from '../requests/update-work-experience.request.js';
import type { WorkExperienceResponse } from '../responses/work-experience.response.js';

@Injectable()
export class WorkExperienceService {
  constructor(
    private readonly repository: WorkExperienceRepository,
    private readonly mapper: WorkExperienceMapper,
  ) {}

  async findAll(userId: string): Promise<WorkExperienceResponse[]> {
    return this.mapper.toResponseList(
      await this.repository.findManyByUserId(userId),
    );
  }

  async create(
    userId: string,
    request: CreateWorkExperienceRequest,
  ): Promise<WorkExperienceResponse> {
    const endDate = request.isCurrent ? null : (request.endDate ?? null);
    this.ensureValidPeriod(request.startDate, endDate, request.isCurrent);
    const record = await this.repository.create(userId, {
      ...request,
      endDate,
      description: request.description ?? null,
    });
    return this.mapper.toResponse(record);
  }

  async update(
    userId: string,
    id: string,
    request: UpdateWorkExperienceRequest,
  ): Promise<WorkExperienceResponse> {
    const current = await this.repository.findByIdAndUserId(id, userId);
    if (!current) {
      throw new WorkExperienceNotFoundException();
    }
    const isCurrent = request.isCurrent ?? current.isCurrent;
    const startDate = request.startDate ?? current.startDate;
    const requestedEndDate =
      request.endDate === undefined ? current.endDate : request.endDate;
    const endDate = isCurrent ? null : requestedEndDate;
    this.ensureValidPeriod(startDate, endDate, isCurrent);

    const updated = await this.repository.update(
      id,
      userId,
      { ...request, ...(isCurrent ? { endDate: null } : {}) },
      {
        startDate: current.startDate,
        endDate: current.endDate,
        isCurrent: current.isCurrent,
      },
    );
    if (!updated) {
      if (!(await this.repository.findByIdAndUserId(id, userId))) {
        throw new WorkExperienceNotFoundException();
      }
      throw new WorkExperienceUpdateConflictException();
    }
    return this.mapper.toResponse(updated);
  }

  async remove(userId: string, id: string): Promise<void> {
    const deleted = await this.repository.delete(id, userId);
    if (!deleted) {
      throw new WorkExperienceNotFoundException();
    }
  }

  private ensureValidPeriod(
    startDate: Date,
    endDate: Date | null,
    isCurrent: boolean,
  ): void {
    if (!isCurrent && !endDate) {
      throw new WorkExperienceEndDateRequiredException();
    }
    if (endDate && endDate < startDate) {
      throw new InvalidWorkExperienceDateRangeException();
    }
  }
}
