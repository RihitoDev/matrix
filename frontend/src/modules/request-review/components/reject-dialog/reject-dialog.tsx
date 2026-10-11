"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
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
import { REJECTION_MAX_LENGTH, REJECTION_REASONS } from "../../constants/request-review.constants";
import { requestReviewService } from "../../services/request-review.service";
import type { RejectDialogProps } from "../../types/reject-dialog-props.types";
import { buildRejectionReason } from "../../utils/build-rejection-reason";

export function RejectDialog({ detail, open, onOpenChange, onRejected }: RejectDialogProps) {
  const [choice, setChoice] = useState<string | null>(null);
  const [hint, setHint] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectError, setRejectError] = useState<string | null>(null);

  const rejection = buildRejectionReason(choice, hint);

  async function handleReject() {
    setIsRejecting(true);
    setRejectError(null);
    const result = await requestReviewService.rejectRequest(detail.id, rejection.reason);
    setIsRejecting(false);
    if (result.ok) {
      onOpenChange(false);
      onRejected(result.data.notificationSent);
    } else {
      setRejectError(result.message);
    }
  }

  function handleOpenChange(next: boolean) {
    if (isRejecting) return;
    onOpenChange(next);
    if (!next) {
      setChoice(null);
      setHint("");
      setRejectError(null);
    }
  }

  const REJECT_BUTTON_CLASS =
    "h-[42px] rounded-lg bg-accent px-5 text-[14.5px] font-semibold text-surface hover:bg-accent/90 disabled:bg-border disabled:text-text-secondary disabled:opacity-100";

  return (
  <AlertDialog open={open} onOpenChange={handleOpenChange}>
    <AlertDialogContent className="gap-5 rounded-[10px] p-8 data-[size=default]:sm:max-w-[36rem]">
      <AlertDialogHeader className="relative text-left">
        <AlertDialogTitle className="font-tight text-[26px] font-extrabold text-ink">Rechazar solicitud</AlertDialogTitle>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Cerrar"
          onClick={() => handleOpenChange(false)}
          className="absolute top-0 right-0 text-ink-soft"
        >
          <X strokeWidth={1.75} aria-hidden="true" />
        </Button>
        <AlertDialogDescription className="text-[15px] text-text-secondary">
          {detail.firstName} {detail.lastName} recibirá este motivo por correo ({detail.email}).
        </AlertDialogDescription>
      </AlertDialogHeader>
      <div className="flex flex-col gap-4">
        <fieldset className="flex flex-col gap-2">
          <legend className="pb-1 text-sm font-semibold text-ink">Motivo</legend>
          <RadioGroup value={choice ?? ""} onValueChange={(value) => setChoice(value)} aria-label="Motivo">
            {REJECTION_REASONS.map((option, index) => (
              <Label
                key={option}
                htmlFor={`reject-reason-${index}`}
                className={cn(
                  "flex h-[52px] cursor-pointer items-center gap-3 rounded-lg border px-4 text-[15px] font-normal text-ink",
                  choice === option ? "border-accent bg-interaction" : "border-border bg-surface",
                )}
              >
                <RadioGroupItem
                  id={`reject-reason-${index}`}
                  value={option}
                  className="size-5 border-border-strong data-checked:border-accent data-checked:bg-surface [&_[data-slot=radio-group-indicator]>span]:bg-accent"
                />
                {option}
              </Label>
            ))}
          </RadioGroup>
        </fieldset>
        <div className="flex flex-col gap-2">
          <Label htmlFor="reject-hint" className="font-semibold text-ink">
            Indicación para el solicitante
          </Label>
          <Textarea
            id="reject-hint"
            value={hint}
            onChange={(event) => setHint(event.target.value)}
            placeholder="Explica qué debe corregir la persona"
            className="min-h-24 rounded-lg"
          />
          <p className="text-xs text-text-secondary" aria-live="polite">
            {rejection.length}/{REJECTION_MAX_LENGTH}
          </p>
          {rejection.error && (
            <p role="alert" className="text-sm text-ink">
              {rejection.error}
            </p>
          )}
          {rejectError && (
            <p role="alert" className="text-sm text-ink">
              {rejectError}
            </p>
          )}
        </div>
      </div>
      <AlertDialogFooter className="flex-row justify-end gap-3 bg-transparent p-0">
        <AlertDialogCancel
            type="button"
            disabled={isRejecting}
            className="h-[42px] rounded-lg border border-border bg-surface px-5 text-[14.5px] font-semibold text-ink hover:bg-surface-soft"
          >
          Cancelar
        </AlertDialogCancel>
        <AlertDialogAction
          type="button"
          disabled={!rejection.isValid || isRejecting}
          className={REJECT_BUTTON_CLASS}
          onClick={(event) => {
            event.preventDefault();
            void handleReject();
          }}
        >
          {isRejecting ? "Rechazando..." : "Rechazar y notificar"}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
  );
}
