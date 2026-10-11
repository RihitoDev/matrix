export const MAIL_SENDER = Symbol('MAIL_SENDER');

export interface MailSender {
  sendActivationCode(to: string, code: string, expiresAt: Date): Promise<void>;
  sendRejection(to: string, reason: string): Promise<void>;
}
