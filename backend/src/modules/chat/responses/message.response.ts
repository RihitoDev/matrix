export interface MessageResponse {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: string;
  createdAt: string;
  status: 'sending' | 'sent' | 'error';
  isAttachment: boolean;
  attachmentType: 'image' | 'file' | 'audio' | null;
}