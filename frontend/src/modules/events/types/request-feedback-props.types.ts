import type { ReactNode } from 'react';
export interface RequestFeedbackProps {
  message: string;
  isError?: boolean;
  onRetry?: () => void;
  retryLabel?: string;
  children?: ReactNode;
}
