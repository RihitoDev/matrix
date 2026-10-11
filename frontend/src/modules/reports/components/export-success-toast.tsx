import { CircleCheck, Info } from "lucide-react";
import type { ExportSuccessToastProps } from "../types/export-success-toast-props.types";

export function ExportSuccessToast({ message, variant = "success" }: ExportSuccessToastProps) {
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-8 z-50 flex justify-center px-4">
      {message && (
        <div className={`pointer-events-auto flex items-center gap-3 rounded-lg border px-5 py-3 text-sm text-ink shadow-lg ${
          variant === "success" ? "border-green-300 bg-green-50" : "border-border bg-surface"
        }`}>
          {variant === "success" ? (
            <CircleCheck className="size-6 shrink-0 fill-green-600 text-green-50" aria-hidden="true" />
          ) : (
            <Info className="size-6 shrink-0 text-ink-soft" aria-hidden="true" />
          )}
          <p>{message}</p>
        </div>
      )}
    </div>
  );
}
