export interface ConfirmDeleteDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  isDeleting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}
