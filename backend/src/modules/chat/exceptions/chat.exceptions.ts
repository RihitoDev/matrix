import { HttpException, HttpStatus } from '@nestjs/common';

export class UserNotFoundException extends HttpException {
  constructor() {
    super('UserNotFoundException', HttpStatus.NOT_FOUND);
  }
}

export class InactiveUserException extends HttpException {
  constructor() {
    super('InactiveUserException', HttpStatus.FORBIDDEN);
  }
}

export class SelfConversationException extends HttpException {
  constructor() {
    super('SelfConversationException', HttpStatus.BAD_REQUEST);
  }
}

export class ConversationNotFoundException extends HttpException {
  constructor() {
    super('ConversationNotFoundException', HttpStatus.NOT_FOUND);
  }
}

export class NotConversationParticipantException extends HttpException {
  constructor() {
    super('NotConversationParticipantException', HttpStatus.FORBIDDEN);
  }
}

export class MessageStatusNotFoundException extends HttpException {
  constructor() {
    super('MessageStatusNotFoundException', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export class InvalidMessageContentException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}