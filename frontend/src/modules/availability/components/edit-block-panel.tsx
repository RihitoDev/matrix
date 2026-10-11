"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BlockForm } from "./block-form";
import { DeleteBlockDialog } from "./delete-block-dialog";
import { BLOCK_LOAD_ERROR, EDIT_BLOCK_HINT } from "../constants/availability.constants";
import { DELETE_BLOCK_TEXT } from "../constants/delete-block.constants";
import { useUpdateAvailabilityBlock } from "../hooks/use-update-availability-block";
import type { CreateAvailabilityBlockInput } from "../types/create-availability-block-input.types";
import type { EditBlockPanelProps } from "../types/edit-block-panel-props.types";

export function EditBlockPanel({ block, onClose }: EditBlockPanelProps) {
  const { updateBlock, isSubmitting } = useUpdateAvailabilityBlock();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  if (!block) {
    return (
      <p role="alert" className="rounded-lg border border-dashed border-border p-6 text-center text-destructive">
        {BLOCK_LOAD_ERROR}
      </p>
    );
  }

  const isEditable = block.state === "free";

  const handleSubmit = async (values: CreateAvailabilityBlockInput) => {
    const updated = await updateBlock(block.id, values);
    if (updated) {
      onClose();
    }
  };

  return (
    <aside aria-label="Panel de edición del bloque" className="flex flex-col gap-4">
      <BlockForm
        mode="edit"
        initialValues={{ startAt: block.startAt, endAt: block.endAt }}
        isSubmitting={isSubmitting}
        disabled={!isEditable}
        onSubmit={handleSubmit}
        onCancel={onClose}
      />

      <div className="flex flex-col items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full border-danger text-danger hover:bg-danger/10 hover:text-danger"
          disabled={!isEditable}
          onClick={() => setIsDeleteOpen(true)}
        >
          {DELETE_BLOCK_TEXT.action}
        </Button>
        {!isEditable && (
          <p className="text-center text-xs text-muted-foreground">{EDIT_BLOCK_HINT}</p>
        )}
      </div>

      <DeleteBlockDialog
        block={block}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onDeleted={onClose}
      />
    </aside>
  );
}
