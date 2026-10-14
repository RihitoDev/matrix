import { Injectable } from '@nestjs/common';
import { MessageStatusRepository } from '../repositories/message-status.repository.js';
import { MessageStatusNotFoundException } from '../exceptions/index.js';
import {
  MESSAGE_STATUS_TITLES,
  type MessageStatusTitle,
} from '../constants/chat.constants.js';

@Injectable()
export class MessageStatusService {
  constructor(
    private readonly messageStatusRepository: MessageStatusRepository,
  ) {}

  async resolveId(title: MessageStatusTitle): Promise<string> {
    const status = await this.messageStatusRepository.findByTitle(title);
    if (!status) {
      throw new MessageStatusNotFoundException();
    }
    return status.id;
  }

  async getSentId(): Promise<string> {
    return this.resolveId(MESSAGE_STATUS_TITLES.SENT);
  }

  async getReadId(): Promise<string> {
    return this.resolveId(MESSAGE_STATUS_TITLES.READ);
  }
}