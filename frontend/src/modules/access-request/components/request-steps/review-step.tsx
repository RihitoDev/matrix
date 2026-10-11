"use client";

import { useEffect } from "react";
import { Check, Hourglass } from "lucide-react";
import { cn } from "cn";
import { useAccessRequestForm } from "../../contexts/access-request-context";
import { formatSubmissionDate } from "../../utils/format-submission-date";
import type { StageState, Stage } from "../../types/review-step.types";

const STATE_TEXT: Record<StageState, string> = {
  done: "Completada",
  current: "En curso",
  pending: "Pendiente",
};

export function ReviewStep() {
  const { values, submission, refreshSubmission } = useAccessRequestForm();

  // Una consulta al montar: la pantalla ya tiene el estado del envío y un fallo no la rompe
  useEffect(() => {
    void refreshSubmission();
  }, [refreshSubmission]);

  if (!submission) return null;

  const isReviewing = submission.status === "pending" || submission.status === "in_review";
  const isApproved = submission.status === "approved";
  const isRejected = submission.status === "rejected";
  const statusLabel = isApproved ? "Aprobada" : isRejected ? "Rechazada" : "En revisión";
  const sentAt = formatSubmissionDate(submission.submittedAt) ?? "Fecha no disponible";
  const reviewedAt = formatSubmissionDate(submission.reviewedAt);

  const stages: Stage[] = [
    { label: "Solicitud enviada", detail: sentAt, state: "done" },
    { label: "Documento recibido", detail: sentAt, state: "done" },
    {
      label: "En revisión",
      detail: isReviewing ? "En curso" : (reviewedAt ?? "Revisión terminada"),
      state: isReviewing ? "current" : "done",
    },
    {
      label: "Activación de tu cuenta",
      detail: isApproved ? "En curso" : isRejected ? "No disponible" : "Pendiente",
      state: isApproved ? "current" : "pending",
    },
  ];

  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink 2xl:text-4xl">Revisión de la carrera</h1>
        {/* TODO: indicar qué hacer tras un rechazo cuando se defina el reenvío (el issue #495 no lo define) */}
        <p className="max-w-155 text-[15px] text-text-secondary 2xl:text-lg">
          {isRejected
            ? "Tu solicitud fue rechazada."
            : `Estamos revisando tu solicitud. Te avisaremos a ${values.email.trim()} cuando tengamos novedades.`}
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5">
        <p className="text-[12.5px] font-semibold text-text-secondary 2xl:text-base">Tu código de solicitud</p>
        <p className="text-3xl font-extrabold tracking-wide text-ink 2xl:text-4xl">{submission.requestCode}</p>
        <p className="text-[12.5px] text-text-secondary 2xl:text-base">
          Guárdalo: lo necesitarás para consultar el estado de tu solicitud.
        </p>
        <p className={cn("text-[14.5px] font-semibold 2xl:text-base", isRejected ? "text-danger" : "text-ink")}>
          {`Estado: ${statusLabel}`}
        </p>
        {isRejected && submission.rejectionReason ? (
          <p role="status" className="text-[13.5px] text-danger 2xl:text-base">
            {`Motivo del rechazo: ${submission.rejectionReason}`}
          </p>
        ) : null}
      </div>

      <ol aria-label="Línea de tiempo de la solicitud" className="flex flex-col rounded-xl border border-border bg-surface p-5">
        {stages.map((stage, index) => (
          <li
            key={stage.label}
            aria-current={stage.state === "current" ? "step" : undefined}
            className={cn("flex gap-3.5", stage.state === "pending" && "opacity-60")}
          >
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border",
                  stage.state === "done" && "border-ink bg-ink text-surface",
                  stage.state === "current" && "border-accent bg-surface text-accent",
                  stage.state === "pending" && "border-border-strong bg-surface text-text-secondary",
                )}
              >
                {stage.state === "done" ? <Check aria-hidden="true" className="size-4" /> : null}
                {stage.state === "current" ? <Hourglass aria-hidden="true" className="size-3.5" /> : null}
              </span>
              {index < stages.length - 1 ? <span aria-hidden="true" className="my-1 h-5 w-[1.5px] bg-border-strong" /> : null}
            </div>
            <div className="pb-2">
              <p className={cn("text-[14.5px] font-semibold 2xl:text-base", stage.state === "current" ? "text-ink" : "text-ink-soft")}>
                {stage.label}
                <span className="sr-only">{`: ${STATE_TEXT[stage.state]}`}</span>
              </p>
              <p className="text-[12.5px] text-text-secondary 2xl:text-base">{stage.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
