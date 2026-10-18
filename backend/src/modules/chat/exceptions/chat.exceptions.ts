import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../../common/exceptions/domain.exception.js';

export class UserNotFoundException extends DomainException {
  constructor() {
    super('Usuario destinatario no encontrado', HttpStatus.NOT_FOUND);
  }
}

export class InactiveUserException extends DomainException {
  constructor() {
    super('El usuario no se encuentra activo', HttpStatus.FORBIDDEN);
  }
}

export class SelfConversationException extends DomainException {
  constructor() {
    super('No es posible iniciar una conversación consigo mismo', HttpStatus.BAD_REQUEST);
  }
}

export class ConversationNotFoundException extends DomainException {
  constructor() {
    super('Conversación no encontrada', HttpStatus.NOT_FOUND);
  }
}

export class NotConversationParticipantException extends DomainException {
  constructor() {
    super('No eres participante de esta conversación', HttpStatus.FORBIDDEN);
  }
}

export class MessageStatusNotFoundException extends DomainException {
  constructor() {
    super('Estado del mensaje no encontrado', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export class InvalidMessageContentException extends DomainException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}