export interface ChatUserResponse {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  headline: string | null;
  role: string;
  isOnline: boolean;
}