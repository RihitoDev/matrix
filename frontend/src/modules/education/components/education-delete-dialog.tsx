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
import { EDUCATION_UI_TEXTS } from "../constants/education-ui.constants";
import type { EducationDeleteDialogProps } from "../types/education-delete-dialog-props.types";
import { FeedbackMessage } from "@/modules/profile/components/feedback-message";

export function EducationDeleteDialog({
  isOpen,
  degree,
  isDeleting,
  feedback,
  onConfirm,
  onCancel,
}: EducationDeleteDialogProps) {
  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isDeleting) onCancel();
      }}
    >
      <AlertDialogContent
        aria-busy={isDeleting}
        className="max-w-md gap-0 rounded-2xl border border-border bg-surface p-8 text-ink shadow-lg ring-0 data-[size=default]:max-w-md data-[size=default]:sm:max-w-md"
      >
        <AlertDialogHeader className="place-items-start text-left">
          <AlertDialogTitle className="font-tight text-[22px] font-bold text-ink">
            {EDUCATION_UI_TEXTS.deleteTitle}
          </AlertDialogTitle>
          <AlertDialogDescription className="mt-2 text-[15px] text-text-secondary">
            {EDUCATION_UI_TEXTS.deleteMessage(degree)}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <FeedbackMessage
          feedback={feedback?.type === "error" ? feedback : null}
        />
        <AlertDialogFooter className="mx-0 mb-0 mt-8 flex-row justify-end gap-3 border-t-0 bg-transparent p-0">
          <AlertDialogCancel
            disabled={isDeleting}
            className="h-12 border-border-strong bg-surface px-6 text-[14px] font-semibold text-ink hover:bg-surface-soft"
          >
            {EDUCATION_UI_TEXTS.cancelButton}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isDeleting}
            onClick={onConfirm}
            className="h-12 bg-accent px-6 text-[14px] font-semibold text-white hover:bg-danger"
          >
            {isDeleting ? (
              <LoaderCircle aria-hidden="true" className="animate-spin" />
            ) : null}
            {isDeleting
              ? EDUCATION_UI_TEXTS.deletingButton
              : EDUCATION_UI_TEXTS.deleteButton}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
