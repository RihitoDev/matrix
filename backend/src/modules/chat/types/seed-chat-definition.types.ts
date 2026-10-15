import type { MessageStatusTitle } from '../constants/chat.constants.js';

export interface SeedMessageStatusDefinition {
  title: MessageStatusTitle;
  description: string;
}

export interface SeedUserPresenceDefinition {
 
  email: string;
  isOnline: boolean;
 
  minutesAgo?: number;
}

export interface SeedMessageDefinition {
 
  fromA: boolean;
  content: string;
   
  minutesAgo: number;
  status: MessageStatusTitle;
}

export interface SeedConversationDefinition {
  key: string; 
  userAEmail: string;
  userBEmail: string;
  lastReadAtByA: 'now' | { minutesAgo: number };
  lastReadAtByB: 'now' | { minutesAgo: number };
  messages: SeedMessageDefinition[];
}