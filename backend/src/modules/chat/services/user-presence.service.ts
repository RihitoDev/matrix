import { Injectable } from '@nestjs/common';
import { UserPresenceRepository } from '../repositories/user-presence.repository.js';

@Injectable()
export class UserPresenceService {
  constructor(
    private readonly userPresenceRepository: UserPresenceRepository,
  ) {}

  async markOnline(userId: string, now: Date = new Date()): Promise<void> {
    await this.userPresenceRepository.upsert(userId, true, now);
  }

  async markOffline(userId: string, now: Date = new Date()): Promise<void> {
    await this.userPresenceRepository.upsert(userId, false, now);
  }

  async mapOnlineStatus(userIds: string[]): Promise<Map<string, boolean>> {
    const rows = await this.userPresenceRepository.findByUserIds(userIds);
    return new Map(rows.map((row) => [row.userId, row.isOnline]));
  }
}