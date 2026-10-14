'use client';

interface ChatErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ChatErrorState({ message, onRetry }: ChatErrorStateProps) {
  return (
    <div role="alert" className="m-4 rounded-xl border border-red-200 bg-red-50 p-4 text-center">
      <p className="text-sm text-red-800">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-800 hover:bg-red-100 focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Reintentar
        </button>
      )}
    </div>
  );
}
