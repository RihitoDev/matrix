export interface ReplaceCvDialogProps {
  file: File | null;
  currentFileName?: string;
  isReplacing?: boolean;
  errorMessage?: string | null;
  onConfirm: (file: File) => void;
  onCancel: () => void;
}
