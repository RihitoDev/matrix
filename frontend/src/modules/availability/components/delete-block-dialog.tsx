"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { BOLIVIA_TIME_LABEL } from "@/shared/constants/date-time.constants";
import { formatBlockRange, toBoliviaTime } from "@/shared/utils/date-time";
import { DELETE_BLOCK_TEXT, STATE_LABELS } from "../constants/delete-block.constants";
import { useDeleteBlock } from "../hooks/use-delete-block";
import type { DeleteBlockDialogProps } from "../types/delete-block-dialog-props.types";
import { formatLongDate } from "../utils/calendar-date";

export function DeleteBlockDialog({
  block,
  open,
  onOpenChange,
  onDeleted,
}: DeleteBlockDialogProps) {
  const { deleteBlock, isDeleting } = useDeleteBlock();

  const handleConfirm = async () => {
    if (!block) return;
    const removed = await deleteBlock(block.id);
    if (removed) {
      onOpenChange(false);
      onDeleted?.();
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="p-6 data-[size=default]:sm:max-w-md">
        <AlertDialogHeader className="text-left">
          <AlertDialogTitle className="font-heading text-lg font-bold text-ink">
            {DELETE_BLOCK_TEXT.title}
          </AlertDialogTitle>
          {block && (
            <div className="w-full rounded-lg border border-border bg-surface-soft p-3">
              <p className="text-[11px] font-semibold text-text-secondary">
                {STATE_LABELS[block.state]}
              </p>
              <p className="font-tight text-base font-bold text-ink">
                {formatLongDate(toBoliviaTime(block.startAt).date)}
              </p>
              <p className="text-xs text-text-secondary">
                {formatBlockRange(block.startAt, block.endAt)} ·{" "}
                {BOLIVIA_TIME_LABEL}
              </p>
            </div>
          )}
          <AlertDialogDescription className="text-sm text-text-secondary">
            {DELETE_BLOCK_TEXT.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex items-center justify-end gap-2">
          <AlertDialogCancel
            className="border-border-strong bg-surface p-5 text-ink hover:bg-surface-soft"
            disabled={isDeleting}
          >
            {DELETE_BLOCK_TEXT.cancel}
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-danger p-5 text-surface hover:bg-danger/90"
            disabled={isDeleting}
            onClick={handleConfirm}
          >
            {isDeleting ? DELETE_BLOCK_TEXT.deleting : DELETE_BLOCK_TEXT.confirm}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
