
'use client';

import { Button } from '@/components/ui/button';

interface ChatConnectionDialogProps {
  open: boolean;
  onRetry: () => void;
  onClose: () => void;
}

export function ChatConnectionDialog({
  open,
  onRetry,
  onClose,
}: ChatConnectionDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="chat-error-title"
        aria-describedby="chat-error-description"
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
      >
        <h2
          id="chat-error-title"
          className="text-lg font-semibold text-[#0B1F2E]"
        >
          Error de conexión
        </h2>

        <p
          id="chat-error-description"
          className="mt-3 text-sm text-slate-600"
        >
          No pudimos cargar tus conversaciones.
          Comprueba tu conexión con el servidor
          e inténtalo nuevamente.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-auto rounded-lg border-slate-300 bg-white px-4 py-2 text-sm font-normal text-slate-800 hover:bg-slate-100"
          >
            Cerrar
          </Button>

          <Button
            type="button"
            variant="default"
            onClick={onRetry}
            className="h-auto rounded-lg bg-[#0B1F2E] px-4 py-2 text-sm text-white hover:bg-[#16364B]"
          >
            Reintentar
          </Button>
        </div>
      </div>
    </div>
  );
}
