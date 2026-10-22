
'use client';

import { Button } from '@/components/ui/button';

interface EmptyChatStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyChatState({
  title,
  description = 'Selecciona una conversación existente en el panel izquierdo o inicia una nueva para comenzar a comunicarte.',
  actionLabel = 'Iniciar una nueva conversación',
  onAction,
}: EmptyChatStateProps) {
  return (
    <div className="flex h-full min-h-[350px] flex-col items-center justify-center p-8 text-center">
      {title && (
        <h2 className="mb-3 text-lg font-semibold text-slate-800">
          {title}
        </h2>
      )}

      <p className="mb-5 max-w-sm text-xs leading-relaxed text-slate-400 md:text-sm">
        {description}
      </p>

      {onAction && (
        <Button
          type="button"
          variant="default"
          onClick={onAction}
          className="h-auto rounded-lg bg-[#0B2545] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#13294B] active:scale-[0.98] md:text-sm"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
