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

type ActivationConfirmDialogProps = {
  open: boolean;
  isActivating: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ActivationConfirmDialog({
  open,
  isActivating,
  onConfirm,
  onCancel,
}: ActivationConfirmDialogProps) {
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && !isActivating) {
      onCancel();
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar activación</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Está seguro de que desea activar su participación como mentor?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isActivating}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={isActivating}
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
          >
            {isActivating ? "Activando..." : "Aceptar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}