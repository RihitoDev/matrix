"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RejectDialog } from "../reject-dialog/reject-dialog";
import { ApproveDialog } from "./approve-dialog";
import { requestReviewService } from "../../services/request-review.service";
import type { VerdictPanelProps } from "../../types/verdict-panel-props.types";

const APPROVED_MESSAGE = "Solicitud aprobada. Se envió el código de activación al correo del titulado.";
const REJECTED_MESSAGE = "Solicitud rechazada. Se notificó al titulado con el motivo.";
const REJECTED_NO_MAIL_MESSAGE = "Solicitud rechazada, pero no se pudo enviar el correo al titulado.";
const APPROVED_NO_CODE_MESSAGE = "Solicitud aprobada, pero no se pudo enviar el código de activación al correo del titulado.";

export function VerdictPanel({ detail, status, onStatusChange }: VerdictPanelProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleApprove() {
    setIsApproving(true);
    setError(null);
    const result = await requestReviewService.approveRequest(detail.id);
    setIsApproving(false);
    setConfirmOpen(false);
    if (result.ok) {
      setMessage(result.data.activationCodeSent ? APPROVED_MESSAGE : APPROVED_NO_CODE_MESSAGE);
      onStatusChange("approved");
    } else {
      setError(result.message);
    }
  }

  return (
    <section className="flex flex-col gap-4 rounded-[10px] border border-border bg-surface p-5" aria-label="Dictamen">
      <h2 className="font-tight text-[17px] font-bold text-ink">Dictamen</h2>

      {status === "in_review" ? (
        <>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => setConfirmOpen(true)}
              disabled={isApproving}
              className="h-[42px] flex-1 rounded-lg bg-ink px-5 text-[14.5px] font-semibold text-surface hover:bg-ink/90"
            >
              <Check strokeWidth={1.75} aria-hidden="true" />
              Aprobar solicitud
            </Button>
            <Button
              variant="outline"
              onClick={() => setRejectOpen(true)}
              disabled={isApproving}
              className="h-[42px] flex-1 rounded-lg border-accent bg-surface px-5 text-[14.5px] font-semibold text-accent hover:bg-interaction hover:text-accent"
            >
              <X strokeWidth={1.75} aria-hidden="true" />
              Rechazar
            </Button>
          </div>
          <p className="text-sm text-text-secondary">
            Revisa el documento y el contraste de datos antes de emitir el dictamen. Al aprobar se genera el código de
            activación de la persona titulada.
          </p>
        </>
      ) : (
        <p className="text-sm text-text-secondary">Esta solicitud ya no admite un dictamen.</p>
      )}

      {message && (
        <p role="status" className="text-sm text-ink">
          {message}
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-ink">
          {error}
        </p>
      )}

      <ApproveDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        email={detail.email}
        isApproving={isApproving}
        onConfirm={() => void handleApprove()}
      />

      <RejectDialog
        detail={detail}
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        onRejected={(notificationSent) => {
          setMessage(notificationSent ? REJECTED_MESSAGE : REJECTED_NO_MAIL_MESSAGE);
          onStatusChange("rejected");
        }}
      />
    </section>
  );
}
