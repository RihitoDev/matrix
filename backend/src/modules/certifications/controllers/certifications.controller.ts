import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUserId } from '../../../common/decorators/current-user-id.decorator.js';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard.js';
import { ResponseInterceptor } from '../../../common/interceptors/response.interceptor.js';
import { RequestValidationPipe } from '../../../common/pipes/request-validation.pipe.js';
import {
  createCertificationSchema,
  type CreateCertificationRequest,
} from '../requests/create-certification.request.js';
import {
  updateCertificationSchema,
  type UpdateCertificationRequest,
} from '../requests/update-certification.request.js';
import { CertificationsService } from '../services/certifications.service.js';
import type { CertificationResponse } from '../types/certification-response.type.js';

@ApiTags('certifications')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'A valid access token is required' })
@UseGuards(JwtAuthGuard)
@UseInterceptors(ResponseInterceptor)
@Controller('certifications')
export class CertificationsController {
  constructor(private readonly certificationsService: CertificationsService) {}

  @Post()
  create(
    @CurrentUserId() userId: string,
    @Body(new RequestValidationPipe(createCertificationSchema))
    request: CreateCertificationRequest,
  ): Promise<CertificationResponse> {
    return this.certificationsService.create(userId, request);
  }

  @Get()
  findAll(@CurrentUserId() userId: string): Promise<CertificationResponse[]> {
    return this.certificationsService.findAll(userId);
  }

  @Patch(':id')
  update(
    @CurrentUserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new RequestValidationPipe(updateCertificationSchema))
    request: UpdateCertificationRequest,
  ): Promise<CertificationResponse> {
    return this.certificationsService.update(userId, id, request);
  }

  @Delete(':id')
  remove(
    @CurrentUserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.certificationsService.remove(userId, id);
  }
}
