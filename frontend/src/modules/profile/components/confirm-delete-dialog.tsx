import { LoaderCircle } from "lucide-react";
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
import type { ConfirmDeleteDialogProps } from "../types/confirm-delete-dialog-props.types";

export function ConfirmDeleteDialog({
  isOpen,
  title,
  message,
  isDeleting = false,
  onConfirm,
  onCancel,
}: ConfirmDeleteDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={isDeleting ? undefined : onCancel}>
      <AlertDialogContent className="max-w-md gap-0 rounded-2xl border border-border bg-surface p-8 text-ink shadow-lg ring-0 data-[size=default]:max-w-md data-[size=default]:sm:max-w-md">
        <AlertDialogHeader className="place-items-start text-left">
          <AlertDialogTitle className="font-tight text-[22px] font-bold text-ink">{title}</AlertDialogTitle>
          <AlertDialogDescription className="mt-2 text-[15px] text-text-secondary">{message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mx-0 mb-0 mt-8 flex-row justify-end gap-3 border-t-0 bg-transparent p-0">
          <AlertDialogCancel
            className="h-12 border-border-strong bg-surface px-6 text-[14px] font-semibold text-ink hover:bg-surface-soft"
            disabled={isDeleting}
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            type="button"
            className="h-12 bg-accent px-6 text-[14px] font-semibold text-white hover:bg-danger"
            disabled={isDeleting}
            onClick={onConfirm}
          >
            {isDeleting ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : null}
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
