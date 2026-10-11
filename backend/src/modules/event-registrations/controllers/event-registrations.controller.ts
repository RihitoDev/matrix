import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import {
  JwtAuthGuard,
  type AuthenticatedRequest,
} from '../../auth/guards/jwt-auth.guard.js';
import { EventRegistrationsService } from '../services/event-registrations.service.js';
@Controller('event-registrations')
@UseGuards(JwtAuthGuard)
export class EventRegistrationsController {
  constructor(private readonly service: EventRegistrationsService) {}
  @Get('me')
  findMine(@Req() request: AuthenticatedRequest) {
    return this.service.findMine(request.user.sub);
  }
}
