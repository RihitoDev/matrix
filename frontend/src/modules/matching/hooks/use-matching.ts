"use client";

import { useMemo, useState } from "react";
import {
  getAffinityAxes,
  getCandidatesForVacancy,
  getVacancies,
  getVacancyById,
} from "../services/matching.service";
import type { CandidateWithMatch } from "../types/matching-types";

const vacancies = getVacancies();
const axes = getAffinityAxes();

export function useMatching() {
  const [vacancyId, setVacancyId] = useState(vacancies[0].id);
  const [query, setQuery] = useState("");
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [discardedIds, setDiscardedIds] = useState<Set<string>>(new Set());
  const [pendingDiscardId, setPendingDiscardId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const vacancy = getVacancyById(vacancyId);

  const candidates: CandidateWithMatch[] = useMemo(() => {
    return getCandidatesForVacancy(vacancyId, query).map(
      (candidate): CandidateWithMatch => ({
        ...candidate,
        status: discardedIds.has(candidate.id) ? "discarded" : "active",
      })
    );
  }, [vacancyId, query, discardedIds]);

  const selectedCandidate =
    candidates.find((c) => c.id === selectedCandidateId) ?? candidates[0] ?? null;

  function selectVacancy(id: string) {
    setVacancyId(id);
    setSelectedCandidateId(null);
    setQuery("");
    setActionFeedback(null);
  }

  function selectCandidate(id: string) {
    setSelectedCandidateId(id);
    setActionFeedback(null);
  }

  function requestDiscard(id: string) {
    setPendingDiscardId(id);
  }

  function cancelDiscard() {
    setPendingDiscardId(null);
  }

  function confirmDiscard() {
    if (!pendingDiscardId) return;
    const discardedCandidate = candidates.find((c) => c.id === pendingDiscardId);
    setDiscardedIds((prev) => new Set(prev).add(pendingDiscardId));
    setActionFeedback(
      discardedCandidate ? `${discardedCandidate.name} fue marcado como descartado.` : null
    );
    setPendingDiscardId(null);
  }

  function confirmSchedule(name: string, date: string, time: string) {
    setActionFeedback(`Entrevista con ${name} propuesta para el ${date} a las ${time}.`);
  }

  return {
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
    cancelDiscard,
    confirmDiscard,
    confirmSchedule,
    actionFeedback,
    axes,
  };
}

export type UseMatchingReturn = ReturnType<typeof useMatching>;
