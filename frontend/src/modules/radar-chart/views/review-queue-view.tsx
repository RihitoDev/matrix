"use client";

import { useState } from "react";

import { Epic3Shell } from "../components/epic3-shell";
import { ReviewProfileDetail } from "../components/review-profile-detail";
import { ReviewProfileList } from "../components/review-profile-list";
import { ReviewQueueFilters } from "../components/review-queue-filters";
import { REVIEW_PROFILES } from "../data/review-queue.data";
import type {
  ReviewAction,
  ReviewProfile,
  ReviewQueueFilter,
} from "../types/review-queue.types";

function ReviewQueueContent() {
  const [activeFilter, setActiveFilter] =
    useState<ReviewQueueFilter>("Todos");

  const [selectedProfile, setSelectedProfile] =
    useState<ReviewProfile | null>(null);

  const [localAction, setLocalAction] =
    useState<ReviewAction | null>(null);

  const filteredProfiles =
    activeFilter === "Todos"
      ? REVIEW_PROFILES
      : REVIEW_PROFILES.filter(
          (profile) => profile.estado === activeFilter,
        );

  function handleFilterChange(filter: ReviewQueueFilter) {
    setActiveFilter(filter);
    setLocalAction(null);

    if (
      selectedProfile &&
      filter !== "Todos" &&
      selectedProfile.estado !== filter
    ) {
      setSelectedProfile(null);
    }
  }

  function handleProfileSelect(profile: ReviewProfile) {
    setSelectedProfile(profile);
    setLocalAction(null);
  }

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Cola de Revisión
          </h1>

          <p className="mt-1 text-sm text-text-secondary">
            Panel Administrador / Radar de Afinidad / Cola de Revisión
          </p>
        </div>

        <div className="grid min-h-[650px] grid-cols-1 overflow-hidden rounded-lg border border-border bg-surface lg:grid-cols-[420px_1fr]">
          <section className="border-b border-border lg:border-r lg:border-b-0">
            <div className="border-b border-border p-5">
              <h2 className="font-semibold text-ink">
                Perfiles enviados
              </h2>

              <p className="mt-1 text-sm text-text-secondary">
                Revisa los perfiles enviados para generar su radar de afinidad.
              </p>

              <ReviewQueueFilters
                activeFilter={activeFilter}
                onFilterChange={handleFilterChange}
              />
            </div>

            <ReviewProfileList
              profiles={filteredProfiles}
              selectedProfileId={selectedProfile?.id ?? null}
              onProfileSelect={handleProfileSelect}
            />
          </section>

          <ReviewProfileDetail
            profile={selectedProfile}
            localAction={localAction}
            onAction={setLocalAction}
          />
        </div>
      </div>
    </main>
  );
}

export function ReviewQueueView() {
  return (
    <Epic3Shell>
      <ReviewQueueContent />
    </Epic3Shell>
  );
}