import type { CertificationDeleteDialogProps } from "../types/certification-delete-dialog-props.types";
import { ConfirmDeleteDialog } from "@/modules/profile/components/confirm-delete-dialog";

export function CertificationDeleteDialog({
  certification,
  isDeleting = false,
  onConfirm,
  onCancel,
}: CertificationDeleteDialogProps) {
  return (
    <ConfirmDeleteDialog
      isOpen={certification !== null}
      title="Eliminar certificación"
      message={`Se eliminará "${certification?.name ?? ""}" de tu perfil. Esta acción no se puede deshacer.`}
      isDeleting={isDeleting}
      onConfirm={() => {
        if (certification) {
          onConfirm(certification);
        }
      }}
      onCancel={onCancel}
    />
  );
}
