import { CircleAlert, FileText, LoaderCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatFileSize } from "@/modules/profile/utils/format-file-size";
import type { ReplaceCvDialogProps } from "../types/replace-cv-dialog-props.types";

export function ReplaceCvDialog({
  file,
  currentFileName,
  isReplacing = false,
  errorMessage = null,
  onConfirm,
  onCancel,
}: ReplaceCvDialogProps) {
  const currentName = (currentFileName ?? "").trim();

  return (
    <AlertDialog open={file !== null} onOpenChange={isReplacing ? undefined : onCancel}>
      <AlertDialogContent className="max-w-md gap-0 rounded-2xl border border-border bg-surface p-8 text-ink shadow-lg ring-0 data-[size=default]:max-w-md data-[size=default]:sm:max-w-md">
        <AlertDialogHeader className="place-items-start text-left">
          <AlertDialogTitle className="font-tight text-[22px] font-bold text-ink">
            ¿Reemplazar tu CV?
          </AlertDialogTitle>
          <AlertDialogDescription className="mt-2 text-[15px] text-text-secondary">
            {currentName
              ? `Se reemplazará ${currentName} por el archivo seleccionado. El archivo anterior se eliminará.`
              : "Se reemplazará tu CV actual por el archivo seleccionado. El archivo anterior se eliminará."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {file ? (
          <p className="mt-5 flex items-center gap-3 rounded-xl border border-border bg-surface-soft px-4 py-3 text-[14px] break-all text-ink">
            <FileText aria-hidden="true" className="size-5 shrink-0 text-ink-soft" />
            {file.name} · {formatFileSize(file.size)}
          </p>
        ) : null}
        {errorMessage ? (
          <p role="alert" className="mt-4 flex items-center gap-2 text-[14px] text-danger">
            <CircleAlert aria-hidden="true" className="size-4 shrink-0 text-accent" />
            {errorMessage}
          </p>
        ) : null}
        <AlertDialogFooter className="mx-0 mb-0 mt-8 flex-row justify-end gap-3 border-t-0 bg-transparent p-0">
          <AlertDialogCancel
            className="h-12 border-border-strong bg-surface px-6 text-[14px] font-semibold text-ink hover:bg-surface-soft"
            disabled={isReplacing}
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            type="button"
            className="h-12 bg-accent px-6 text-[14px] font-semibold text-white hover:bg-danger"
            disabled={isReplacing || !file}
            onClick={file ? () => onConfirm(file) : undefined}
          >
            {isReplacing ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : null}
            {isReplacing ? "Reemplazando..." : "Reemplazar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
