import { Body, Controller, HttpCode, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { createJobOfferSchema } from './create-job-offer.schema.js';
import type { CreateJobOfferPayload } from './create-job-offer.schema.js';
import { JobOffersValidationPipe } from './job-offers-validation.pipe.js';
import { JobOffersService } from './job-offers.service.js';

@ApiTags('job-offers')
@Controller('v1/empresas/:empresaId/ofertas')
export class JobOffersController {
  constructor(private readonly jobOffersService: JobOffersService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Publica una nueva vacante de la empresa' })
  create(
    @Param('empresaId', ParseUUIDPipe) empresaId: string,
    @Body(new JobOffersValidationPipe(createJobOfferSchema))
    payload: CreateJobOfferPayload,
  ) {
    // El ResponseInterceptor global agrega statusCode, data, detail y ok
    return this.jobOffersService.create(empresaId, payload);
  }
}