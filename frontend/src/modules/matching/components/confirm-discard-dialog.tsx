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

interface ConfirmDiscardDialogProps {
  open: boolean;
  candidateName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDiscardDialog({
  open,
  candidateName,
  onConfirm,
  onCancel,
}: ConfirmDiscardDialogProps) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onCancel();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Descartar perfil</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Confirmas que deseas descartar a {candidateName}? Esta acción solo afecta tu
            vista actual.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-danger text-surface hover:bg-danger/90"
            onClick={onConfirm}
          >
            Sí, descartar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
