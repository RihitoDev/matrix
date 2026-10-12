export interface ConversationResponse {
  id: string;
  contact: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
    isOnline: boolean;
  };
  lastMessage: {
    id: string;
    senderId: string;
    content: string;
    isAttachment: boolean;
    attachmentType: 'image' | 'file' | 'audio' | null;
    createdAt: string;
  } | null;
  unreadCount: number;
  updatedAt: string;
}