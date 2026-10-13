import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module.js';
import { JwtAuthModule } from '../../common/guards/jwt-auth.module.js';

import { UserSearchController } from './controllers/user-search.controller.js';
import { ConversationController } from './controllers/conversation.controller.js';
import { MessageController } from './controllers/message.controller.js';

import { UserSearchService } from './services/user-search.service.js';
import { ConversationService } from './services/conversation.service.js';
import { MessageService } from './services/message.service.js';
import { MessageStatusService } from './services/message-status.service.js';
import { UserPresenceService } from './services/user-presence.service.js';

import { ConversationRepository } from './repositories/conversation.repository.js';
import { ConversationParticipantRepository } from './repositories/conversation-participant.repository.js';
import { MessageRepository } from './repositories/message.repository.js';
import { MessageStatusRepository } from './repositories/message-status.repository.js';
import { UserPresenceRepository } from './repositories/user-presence.repository.js';
import { UserLookupRepository } from './repositories/user-lookup.repository.js';

@Module({
  imports: [PrismaModule, JwtAuthModule],
  controllers: [
    UserSearchController,
    ConversationController,
    MessageController,
  ],
  providers: [
    UserSearchService,
    ConversationService,
    MessageService,
    MessageStatusService,
    UserPresenceService,

    ConversationRepository,
    ConversationParticipantRepository,
    MessageRepository,
    MessageStatusRepository,
    UserPresenceRepository,
    UserLookupRepository,
  ],
  exports: [
    ConversationService,
    MessageService,
    UserSearchService,
    UserPresenceService,
  ],
})
export class ChatModule {}