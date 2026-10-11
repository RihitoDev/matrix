export interface ApproveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  isApproving: boolean;
  onConfirm: () => void;
}
