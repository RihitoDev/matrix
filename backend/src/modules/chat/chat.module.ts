
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { ChatController } from './controllers/chat.controller.js';
import { ChatRepository } from './repositories/chat.repository.js';
import { ChatService } from './services/chat.service.js';

@Module({
  imports: [AuthModule],
  controllers: [ChatController],
  providers: [ChatRepository, ChatService],
})
export class ChatModule {}
