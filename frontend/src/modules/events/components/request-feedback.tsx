import { Button } from '@/components/ui/button';
import type { RequestFeedbackProps } from '../types/request-feedback-props.types';
export function RequestFeedback({
  message,
  isError = false,
  onRetry,
  retryLabel = 'Reintentar',
  children,
}: RequestFeedbackProps) {
  return (
    <div
      role={isError ? 'alert' : 'status'}
      className="py-4 text-sm text-text-secondary"
    >
      <p className={isError ? 'text-danger' : undefined}>{message}</p>
      {children}
      {onRetry && (
        <Button
          type="button"
          variant="link"
          onClick={onRetry}
          className="mt-2 text-ink"
        >
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
