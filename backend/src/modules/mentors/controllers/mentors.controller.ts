import {
  Body,
  Controller,
  Get,
  Patch,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard.js';
import { ResponseInterceptor } from '../../../common/interceptors/index.js';
import { ZodValidationPipe } from 'nestjs-zod';
import type { AuthenticatedUser } from '../../../common/types/authenticated-user.types.js';
import {
  activateMentorSchema,
  type ActivateMentorDto,
} from '../requests/activate-mentor.schema.js';
import {
  updateMentorTechnicalAreasSchema,
  type UpdateMentorTechnicalAreasDto,
} from '../requests/update-mentor-technical-areas.schema.js';
import {
  updateMentorOrientationTypesSchema,
  type UpdateMentorOrientationTypesDto,
} from '../requests/update-mentor-orientation-types.schema.js';
import { MentorsService } from '../services/mentors.service.js';

@Controller('mentors')
@UseInterceptors(ResponseInterceptor)
export class MentorsController {
  constructor(private readonly mentorsService: MentorsService) {}

  @Get()
  findAll() {
    return this.mentorsService.findAll();
  }

  @Get('me/technical-areas')
  @UseGuards(JwtAuthGuard)
  findMyTechnicalAreas(@CurrentUser() user: AuthenticatedUser) {
    return this.mentorsService.findMyTechnicalAreas(user.id);
  }

  @Patch('me/technical-areas')
  @UseGuards(JwtAuthGuard)
  updateMyTechnicalAreas(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(updateMentorTechnicalAreasSchema))
    body: UpdateMentorTechnicalAreasDto,
  ) {
    return this.mentorsService.updateMyTechnicalAreas(user.id, body);
  }

  @Get('me/orientation-types')
  @UseGuards(JwtAuthGuard)
  findMyOrientationTypes(@CurrentUser() user: AuthenticatedUser) {
    return this.mentorsService.findMyOrientationTypes(user.id);
  }

  @Patch('me/orientation-types')
  @UseGuards(JwtAuthGuard)
  updateMyOrientationTypes(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(updateMentorOrientationTypesSchema))
    body: UpdateMentorOrientationTypesDto,
  ) {
    return this.mentorsService.updateMyOrientationTypes(user.id, body);
  }

  @Get(':userId')
  findOne(
    @Param('userId', new ParseUUIDPipe({ version: '4' })) userId: string,
  ) {
    return this.mentorsService.findOne(userId);
  }

  @Post('activate')
  @UseGuards(JwtAuthGuard)
  activate(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(activateMentorSchema)) body: ActivateMentorDto,
  ) {
    return this.mentorsService.activate(user.id, body);
  }
}
