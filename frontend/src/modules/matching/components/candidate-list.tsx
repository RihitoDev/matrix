"use client";

import { Input } from "@/components/ui/input";
import type { CandidateWithMatch } from "../types/matching-types";
import { CandidateListItem } from "./candidate-list-item";

interface CandidateListProps {
  query: string;
  onQueryChange: (query: string) => void;
  candidates: CandidateWithMatch[];
  selectedCandidateId: string | null;
  onSelectCandidate: (id: string) => void;
}

export function CandidateList({
  query,
  onQueryChange,
  candidates,
  selectedCandidateId,
  onSelectCandidate,
}: CandidateListProps) {
  return (
    <div className="flex h-full flex-col gap-3">
      <Input
        type="search"
        placeholder="Buscar candidato, cargo..."
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        aria-label="Buscar candidato"
      />

      <p className="text-xs text-muted-foreground">
        {candidates.length} candidato{candidates.length === 1 ? "" : "s"} · ordenados por
        compatibilidad
      </p>

      {candidates.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          No se encontraron candidatos para &quot;{query}&quot;.
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto pr-1">
          {candidates.map((candidate) => (
            <CandidateListItem
              key={candidate.id}
              candidate={candidate}
              selected={candidate.id === selectedCandidateId}
              onSelect={onSelectCandidate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
