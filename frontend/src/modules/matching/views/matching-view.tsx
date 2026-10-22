"use client";

import { PageHeading } from "@/shared/components/layout";
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
    <div className="mx-auto flex h-full w-full max-w-7xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <PageHeading title="Buscar candidatos por afinidad" description="Compara candidatos para cada vacante." />
      </div>

      <VacancyTabs vacancies={vacancies} activeVacancyId={vacancyId} onChange={selectVacancy} />

      <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
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
            key={`${vacancyId}:${selectedCandidate?.id ?? "none"}`}
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
