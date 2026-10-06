'use client';

interface EmptyChatStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyChatState({
  description = 'Selecciona una conversacion existente en el panel izquierdo o inicia una nueva para comenzar a comunicarte.',
  actionLabel = 'Iniciar una nueva conversacion',
  onAction,
}: EmptyChatStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center h-full min-h-[350px]">
      <p className="text-xs md:text-sm text-slate-400 max-w-sm mb-5 leading-relaxed">
        {description}
      </p>

      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center justify-center px-5 py-2.5 text-xs md:text-sm font-semibold rounded-lg text-white bg-[#0B2545] hover:bg-[#13294B] active:scale-98 transition-all shadow-sm focus:outline-none"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}