import { Inject, Injectable, Logger } from '@nestjs/common';
import { MAIL_SENDER, type MailSender } from '../mail/mail-sender.js';

@Injectable()
export class RejectionNotificationService {
  private readonly logger = new Logger(RejectionNotificationService.name);

  constructor(@Inject(MAIL_SENDER) private readonly mailSender: MailSender) {}

  async notify(email: string, reason: string, accessRequestId: string): Promise<boolean> {
    try {
      await this.mailSender.sendRejection(email, reason);
      return true;
    } catch (error) {
      this.logger.error(
        `No se pudo enviar el correo de rechazo de la solicitud ${accessRequestId}`,
        error instanceof Error ? error.stack : String(error),
      );
      return false;
    }
  }
}
