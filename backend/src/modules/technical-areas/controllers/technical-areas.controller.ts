import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { ResponseInterceptor } from '../../../common/interceptors/index.js';
import { TechnicalAreasService } from '../services/technical-areas.service.js';

@Controller('technical-areas')
@UseInterceptors(ResponseInterceptor)
export class TechnicalAreasController {
  constructor(private readonly technicalAreasService: TechnicalAreasService) {}

  @Get()
  findAll() {
    return this.technicalAreasService.findAll();
  }
}
