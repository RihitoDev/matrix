import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { Roles } from '../../../common/decorators/roles.decorator.js';
import { RolesGuard } from '../../../common/guards/roles.guard.js';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import { ResponseInterceptor } from '../../../common/interceptors/index.js';
import type { AuthenticatedUser } from '../../../common/types/authenticated-user.types.js';
import { MessageService } from '../services/message.service.js';
import {
  sendMessageSchema,
  type SendMessageDto,
} from '../requests/send-message.schema.js';
import {
  getMessagesQuerySchema,
  type GetMessagesQuery,
} from '../requests/get-messages.schema.js';

@Controller('chat/messages')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('titulado', 'estudiante', 'mentor', 'empresa')
@UseInterceptors(ResponseInterceptor)
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  send(
    @Body(new ZodValidationPipe(sendMessageSchema)) body: SendMessageDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.messageService.send({
      conversationId: body.conversationId,
      senderId: user.id,
      content: body.content,
    });
  }

  @Get()
  getPage(
    @Query(new ZodValidationPipe(getMessagesQuerySchema))
    query: GetMessagesQuery,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.messageService.getPage({
      conversationId: query.conversationId,
      userId: user.id,
      cursor: query.cursor ?? null,
      limit: query.limit,
    });
  }
}