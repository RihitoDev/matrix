import {
  Body,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
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
@UseGuards(JwtAuthGuard)
@UseInterceptors(ResponseInterceptor)
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createConversationSchema))
  createOrGet(
    @Body() body: CreateConversationDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ConversationResponse> {
    return this.conversationService.getOrCreate(user.id, body.contactId);
  }
}