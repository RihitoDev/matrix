import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import type { Response } from 'express';
import { ZodValidationPipe } from 'nestjs-zod';
import { Roles } from '../../../common/decorators/roles.decorator.js';
import { RolesGuard } from '../../../common/guards/roles.guard.js';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import { ResponseInterceptor } from '../../../common/interceptors/index.js';
import type { AuthenticatedUser } from '../../../common/types/authenticated-user.types.js';
import { ConversationService } from '../services/conversation.service.js';
import {
  createConversationSchema,
  type CreateConversationDto,
} from '../requests/create-conversation.schema.js';
import type { ConversationResponse } from '../responses/conversation.response.js';

@Controller('chat/conversations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('titulado', 'mentor')
@UseInterceptors(ResponseInterceptor)
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ConversationResponse[]> {
    return this.conversationService.findAllForUser(user.id);
  }

  @Post()
  async createOrGet(
    @Body(new ZodValidationPipe(createConversationSchema))
    body: CreateConversationDto,
    @CurrentUser() user: AuthenticatedUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ConversationResponse> {
    const result = await this.conversationService.getOrCreateWithStatus(
      user.id,
      body.contactId,
    );
    if (!result.isCreated) {
      res.status(HttpStatus.OK);
    }
    return result.conversation;
  }
}