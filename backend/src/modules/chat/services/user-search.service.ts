import { Injectable } from '@nestjs/common';
import { UserLookupRepository } from '../repositories/user-lookup.repository.js';
import {
  MIN_SEARCH_CHARS,
  MAX_SEARCH_RESULTS,
} from '../constants/chat.constants.js';
import type { ChatUserResponse } from '../responses/chat-user.response.js';

@Injectable()
export class UserSearchService {
  constructor(private readonly userLookupRepository: UserLookupRepository) {}

  async search(
    rawQuery: string,
    currentUserId: string,
  ): Promise<ChatUserResponse[]> {
    const normalized = this.normalize(rawQuery);

    if (normalized.length < MIN_SEARCH_CHARS) {
      return [];
    }

    const rows = await this.userLookupRepository.searchActiveByName(
      normalized,
      currentUserId,
      MAX_SEARCH_RESULTS,
    );

    return rows.map((row) => ({
      id: row.id,
      fullName: `${row.first_name} ${row.last_name}`.trim(),
      avatarUrl: null, 
      headline: row.headline,
      role: row.role_name ?? 'GRADUATE',
      isOnline: row.is_online ?? false,
    }));
  }

  private normalize(text: string): string {
    return text
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}