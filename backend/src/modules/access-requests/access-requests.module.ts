import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { FilesModule } from '../files/files.module.js';
import { AccessRequestsController } from './controllers/access-requests.controller.js';
import { AccessRequestsService } from './services/access-requests.service.js';
import { AccessRequestsRepository } from './repositories/access-requests.repository.js';
import { ActivationOtpRepository } from './repositories/activation-otp.repository.js';
import { RejectionNotificationService } from './services/rejection-notification.service.js';
import { ActivationOtpService } from './services/activation-otp.service.js';
import { ConsoleMailSender } from './mail/console-mail-sender.js';
import { MAIL_SENDER } from './mail/mail-sender.js';

@Module({
  imports: [AuthModule, FilesModule],
  controllers: [AccessRequestsController],
  providers: [
    AccessRequestsService,
    AccessRequestsRepository,
    ActivationOtpRepository,
    ActivationOtpService,
    RejectionNotificationService,
    { provide: MAIL_SENDER, useClass: ConsoleMailSender },
  ],
  exports: [AccessRequestsService],
})
export class AccessRequestsModule {}
