
'use client';

import { Button } from '@/components/ui/button';

interface ChatErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ChatErrorState({ message, onRetry }: ChatErrorStateProps) {
  return (
    <div
      role="alert"
      className="m-4 rounded-xl border border-red-200 bg-red-50 p-4 text-center"
    >
      <p className="text-sm text-red-800">{message}</p>

      {onRetry && (
        <Button
          type="button"
          variant="outline"
          onClick={onRetry}
          className="mt-3 border-red-200 bg-white text-red-700 hover:bg-red-100"
        >
          Reintentar
        </Button>
      )}
    </div>
  );
}
