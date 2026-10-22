import { CircleCheck } from "lucide-react";
import type { ExportSuccessToastProps } from "../types/export-success-toast-props.types";

export function ExportSuccessToast({ message }: ExportSuccessToastProps) {
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex justify-end sm:inset-x-auto sm:right-6 sm:bottom-6">
      {message && (
        <div className="pointer-events-auto flex items-center gap-3 rounded-lg border border-border bg-surface-soft px-5 py-3 text-sm text-ink shadow-sm">
          <CircleCheck className="size-6 shrink-0 fill-none text-ink-soft" aria-hidden="true" />
          <p>{message}</p>
        </div>
      )}
    </div>
  );
}
