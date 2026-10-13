import { CircleCheck } from "lucide-react";
import type { ExportSuccessToastProps } from "../types/export-success-toast-props.types";

export function ExportSuccessToast({ message }: ExportSuccessToastProps) {
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-8 z-50 flex justify-center px-4">
      {message && (
        <div className="pointer-events-auto flex items-center gap-3 rounded-lg border border-green-300 bg-green-50 px-5 py-3 text-sm text-ink shadow-lg">
          <CircleCheck className="size-6 shrink-0 fill-green-600 text-green-50" aria-hidden="true" />
          <p>{message}</p>
        </div>
      )}
    </div>
  );
}
