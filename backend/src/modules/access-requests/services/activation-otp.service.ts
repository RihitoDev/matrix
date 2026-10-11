import { Inject, Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'node:crypto';
import { OTP_BCRYPT_ROUNDS, OTP_DIGITS, OTP_TTL_HOURS } from '../constants/otp.constants.js';
import { MAIL_SENDER, type MailSender } from '../mail/mail-sender.js';
import { ActivationOtpRepository } from '../repositories/activation-otp.repository.js';
import { MS_PER_HOUR } from '../constants/otp.constants.js';

export function generateOtpCode(): string {
  return String(randomInt(0, 10 ** OTP_DIGITS)).padStart(OTP_DIGITS, '0');
}

@Injectable()
export class ActivationOtpService {
  private readonly logger = new Logger(ActivationOtpService.name);

  constructor(
    private readonly otpRepository: ActivationOtpRepository,
    @Inject(MAIL_SENDER) private readonly mailSender: MailSender,
  ) {}

  async issueFor(accessRequestId: string, email: string, now: Date = new Date()): Promise<boolean> {
    try {
      const code = generateOtpCode();
      const expiresAt = new Date(now.getTime() + OTP_TTL_HOURS * MS_PER_HOUR);
      const codeHash = await bcrypt.hash(code, OTP_BCRYPT_ROUNDS);
      await this.otpRepository.create({ accessRequestId, codeHash, expiresAt });
      await this.mailSender.sendActivationCode(email, code, expiresAt);
      return true;
    } catch (error) {
      this.logger.error(
        `No se pudo generar o enviar el código de activación de la solicitud ${accessRequestId}`,
        error instanceof Error ? error.stack : String(error),
      );
      return false;
    }
  }
}
