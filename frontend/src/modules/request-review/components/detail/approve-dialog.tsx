"use client";

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
import type { ApproveDialogProps } from "../../types/approve-dialog-props.types";

export function ApproveDialog({ open, onOpenChange, email, isApproving, onConfirm }: ApproveDialogProps) {
  return (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>¿Aprobar la solicitud?</AlertDialogTitle>
        <AlertDialogDescription>
          Se enviará el código de activación al correo del titulado ({email}).
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel type="button" disabled={isApproving}>
          Cancelar
        </AlertDialogCancel>
        <AlertDialogAction
          type="button"
          disabled={isApproving}
          onClick={(event) => {
            event.preventDefault();
            onConfirm();
          }}
        >
          {isApproving ? "Aprobando..." : "Aprobar y enviar código"}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
  );
}
