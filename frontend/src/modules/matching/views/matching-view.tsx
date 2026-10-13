"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMatching } from "../hooks/use-matching";
import { VacancyTabs } from "../components/vacancy-tabs";
import { CandidateList } from "../components/candidate-list";
import { CandidateDetailPanel } from "../components/candidate-detail-panel";

export function MatchingView() {
  const {
    axes,
    vacancies,
    vacancy,
    vacancyId,
    selectVacancy,
    query,
    setQuery,
    candidates,
    selectedCandidate,
    selectCandidate,
    pendingDiscardId,
    requestDiscard,
    confirmDiscard,
    cancelDiscard,
    confirmSchedule,
    actionFeedback,
  } = useMatching();

  return (
    <div className="flex h-full flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-foreground">Buscar candidatos por afinidad</h1>
        <p className="text-sm text-muted-foreground">
          Radar Charts · Reclutamiento — HU3: Matriz de Compatibilidad y Análisis de Brechas
        </p>
      </div>

      <VacancyTabs vacancies={vacancies} activeVacancyId={vacancyId} onChange={selectVacancy} />

      <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-[360px_1fr]">
        <Card className="flex min-h-[420px] flex-col lg:h-full">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {vacancy ? `Candidatos · ${vacancy.title}` : "Candidatos"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            <CandidateList
              query={query}
              onQueryChange={setQuery}
              candidates={candidates}
              selectedCandidateId={selectedCandidate?.id ?? null}
              onSelectCandidate={selectCandidate}
            />
          </CardContent>
        </Card>

        <div className="min-h-[420px] lg:h-full">
          <CandidateDetailPanel
            candidate={selectedCandidate}
            vacancy={vacancy}
            axes={axes}
            pendingDiscardId={pendingDiscardId}
            onRequestDiscard={requestDiscard}
            onConfirmDiscard={confirmDiscard}
            onCancelDiscard={cancelDiscard}
            onConfirmSchedule={confirmSchedule}
            actionFeedback={actionFeedback}
          />
        </div>
      </div>
    </div>
  );
}
