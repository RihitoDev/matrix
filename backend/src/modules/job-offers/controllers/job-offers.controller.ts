import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  StandardSchemaValidationPipe,
  UsePipes,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { RequestValidationException } from '../../../common/exceptions/request-validation.exception.js';
import { buildRequestValidationException } from '../../../common/utils/build-request-validation-exception.js';
import { toApiBody } from '../../../common/utils/to-api-body.js';
import { JOB_OFFER_VALIDATION_MESSAGES } from '../constants/job-offer.constants.js';
import {
  createJobOfferSchema,
  type CreateJobOfferRequest,
} from '../requests/create-job-offer.request.js';
import type { JobOfferCreatedResponse } from '../responses/job-offer-created.response.js';
import type {
  JobOfferResponse,
  JobOfferSkillResponse,
} from '../responses/job-offer.response.js';
import { JobOffersService } from '../services/job-offers.service.js';

const companyIdPipe = new ParseUUIDPipe({
  exceptionFactory: () =>
    new RequestValidationException([
      { field: 'companyId', message: JOB_OFFER_VALIDATION_MESSAGES.INVALID_COMPANY_ID },
    ]),
});

// TODO: proteger con JwtAuthGuard y el rol empresa cuando el login devuelva el companyId (Epic 1)
@ApiTags('job-offers')
@UsePipes(
  new StandardSchemaValidationPipe({
    exceptionFactory: buildRequestValidationException,
  }),
)
@Controller()
export class JobOffersController {
  constructor(private readonly jobOffersService: JobOffersService) {}

  @Get('job-offers')
  @ApiOperation({ summary: 'Lista las vacantes publicadas y vigentes para los egresados' })
  @ApiOkResponse({ description: 'Vacantes publicadas, de la más reciente a la más antigua' })
  listPublished(): Promise<JobOfferResponse[]> {
    return this.jobOffersService.listPublished();
  }

  @Get('job-offers/skills')
  @ApiOperation({ summary: 'Lista el catálogo cerrado de tecnologías para una vacante' })
  @ApiOkResponse({ description: 'Tecnologías verificadas del catálogo' })
  listSkillCatalog(): Promise<JobOfferSkillResponse[]> {
    return this.jobOffersService.listSkillCatalog();
  }

  @Post('companies/:companyId/job-offers')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Publica una nueva vacante de la empresa' })
  @ApiBody(toApiBody(createJobOfferSchema))
  @ApiCreatedResponse({ description: 'Vacante publicada' })
  create(
    @Param('companyId', companyIdPipe) companyId: string,
    @Body({ schema: createJobOfferSchema }) request: CreateJobOfferRequest,
  ): Promise<JobOfferCreatedResponse> {
    return this.jobOffersService.create(companyId, request);
  }

  @Get('companies/:companyId/job-offers')
  @ApiOperation({ summary: 'Lista las vacantes de una empresa' })
  @ApiOkResponse({ description: 'Vacantes de la empresa, de la más reciente a la más antigua' })
  listByCompany(@Param('companyId', companyIdPipe) companyId: string): Promise<JobOfferResponse[]> {
    return this.jobOffersService.listByCompany(companyId);
  }
}
