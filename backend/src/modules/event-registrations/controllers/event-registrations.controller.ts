import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard.js';
import type { AuthenticatedUser } from '../../../common/types/authenticated-user.types.js';
import { EventRegistrationsService } from '../services/event-registrations.service.js';

@Controller('event-registrations')
@UseGuards(JwtAuthGuard)
export class EventRegistrationsController {
  constructor(private readonly service: EventRegistrationsService) {}

  @Get('me')
  findMine(@CurrentUser() user: AuthenticatedUser) {
    return this.service.findMine(user.id);
  }
}
