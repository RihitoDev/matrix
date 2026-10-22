'use client';

interface ChatErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ChatErrorState({ message, onRetry }: ChatErrorStateProps) {
  return (
    <div role="alert" className="m-4 rounded-xl border border-danger/25 bg-surface p-4 text-center">
      <p className="text-sm text-danger">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-lg border border-danger/30 bg-white px-4 py-2 text-sm font-semibold text-danger hover:bg-interaction focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Reintentar
        </button>
      )}
    </div>
  );
}
