"use client";

import { useState } from "react";
import { AreaDetailPanel } from "@/modules/radar-chart/components/area-detail-panel";
import type { AreaId } from "@/modules/radar-chart/types/area-detail.types";
import { getCandidateAreaDetail } from "../data/candidate-area-evidence.data";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getInitials } from "@/shared/utils/get-initials";
import { RadarChart } from "./radar-chart";
import { GapBreakdownList } from "./gap-breakdown-list";
import { ConfirmDiscardDialog } from "./confirm-discard-dialog";
import type { AffinityAxis, CandidateWithMatch, Vacancy } from "../types/matching-types";

type InlineAction = "contact" | "schedule" | null;

interface CandidateDetailPanelProps {
  candidate: CandidateWithMatch | null;
  vacancy: Vacancy | null;
  axes: AffinityAxis[];
  pendingDiscardId: string | null;
  onRequestDiscard: (id: string) => void;
  onConfirmDiscard: () => void;
  onCancelDiscard: () => void;
  onConfirmSchedule: (name: string, date: string, time: string) => void;
  actionFeedback: string | null;
}

export function CandidateDetailPanel({
  candidate,
  vacancy,
  axes,
  pendingDiscardId,
  onRequestDiscard,
  onConfirmDiscard,
  onCancelDiscard,
  onConfirmSchedule,
  actionFeedback,
}: CandidateDetailPanelProps) {
  const [inlineAction, setInlineAction] = useState<InlineAction>(null);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [selectedAreaId, setSelectedAreaId] = useState<AreaId | null>(null);

  if (!candidate || !vacancy) {
    return (
      <Card className="flex h-full items-center justify-center">
        <CardContent className="text-center text-sm text-muted-foreground">
          Selecciona un candidato de la lista para ver su detalle.
        </CardContent>
      </Card>
    );
  }

  const isDiscarded = candidate.status === "discarded";
  const isPendingDiscard = pendingDiscardId === candidate.id;

  function handleSubmitSchedule() {
    if (!candidate || !scheduleDate || !scheduleTime) return;

    onConfirmSchedule(candidate.name, scheduleDate, scheduleTime);
    setInlineAction(null);
    setScheduleDate("");
    setScheduleTime("");
  }

  return (
    <Card className="flex h-full flex-col overflow-y-auto">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
              {getInitials(candidate.name)}
            </span>
            <div>
              <CardTitle className="text-base">{candidate.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{candidate.role}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Compatibilidad vs. {vacancy.title}
            </p>
            <p className="text-2xl font-semibold text-foreground">{candidate.matchPercent}%</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-5">
        <RadarChart
          axes={axes.map((axis) => ({ id: axis.id, label: axis.label }))}
          series={[
            {
              id: "candidate",
              name: candidate.name,
              color: "var(--color-accent)",
              values: candidate.scores,
            },
            {
              id: "target",
              name: "Perfil objetivo",
              color: "var(--color-ink-soft)",
              values: vacancy.targetProfile,
            },
          ]}
          onAxisSelect={setSelectedAreaId}
        />

        <GapBreakdownList axes={axes} gaps={candidate.gaps} />

        {selectedAreaId && (
          <div className="flex min-w-0 flex-col gap-2" role="region" aria-label={`Evidencias de ${candidate.name}`}>
            <p className="text-xs text-muted-foreground">
              Información ilustrativa de {candidate.name}; cursos, certificaciones y experiencias de demostración.
            </p>
            <AreaDetailPanel
              area={getCandidateAreaDetail(candidate, selectedAreaId)}
              onClose={() => setSelectedAreaId(null)}
            />
          </div>
        )}

        {actionFeedback && (
          <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
            {actionFeedback}
          </div>
        )}

        <div className="mt-auto flex flex-col gap-2 pt-2">
          {isDiscarded ? (
            <p className="rounded-md border border-border bg-muted px-3 py-2 text-center text-sm text-muted-foreground">
              Este perfil fue descartado.
            </p>
          ) : (
            <>
              <Button
                type="button"
                className="w-full"
                onClick={() => setInlineAction(inlineAction === "contact" ? null : "contact")}
              >
                Contactar candidato
              </Button>
              <Button
                type="button"
                className="w-full"
                onClick={() => setInlineAction(inlineAction === "schedule" ? null : "schedule")}
              >
                Agendar entrevista
              </Button>
              <Button
                type="button"
                className="w-full"
                onClick={() => onRequestDiscard(candidate.id)}
              >
                Descartar perfil
              </Button>
            </>
          )}

          <ConfirmDiscardDialog
            open={isPendingDiscard && !isDiscarded}
            candidateName={candidate.name}
            onConfirm={onConfirmDiscard}
            onCancel={onCancelDiscard}
          />

          {inlineAction === "contact" && !isDiscarded && (
            <div className="rounded-lg border border-border bg-muted/50 p-3 text-sm">
              <p className="font-medium text-foreground">Datos de contacto</p>
              <p className="mt-1 text-muted-foreground">
                {candidate.name.toLowerCase().replace(/\s+/g, ".")}@umss-egresados.bo
              </p>
              <p className="text-muted-foreground" aria-label="Teléfono de demostración">
                {candidate.demoPhone}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Datos ficticios: no utilizar para contactar.</p>
            </div>
          )}

          {inlineAction === "schedule" && !isDiscarded && (
            <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/50 p-3">
              <p className="text-sm font-medium text-foreground">Proponer entrevista</p>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={scheduleDate}
                  onChange={(event) => setScheduleDate(event.target.value)}
                  aria-label="Fecha de entrevista"
                />
                <Input
                  type="time"
                  value={scheduleTime}
                  onChange={(event) => setScheduleTime(event.target.value)}
                  aria-label="Hora de entrevista"
                />
              </div>
              <Button
                type="button"
                size="sm"
                disabled={!scheduleDate || !scheduleTime}
                onClick={handleSubmitSchedule}
              >
                Confirmar propuesta
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}