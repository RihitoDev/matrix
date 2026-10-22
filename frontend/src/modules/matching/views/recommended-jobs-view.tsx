"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { JobRecommendationCard } from "../components/job-recommendation-card";
import { JobsEmptyState } from "../components/jobs-empty-state";
import {
  JOB_MATCHING_MESSAGES,
} from "../constants/job-matching.constants";
import { useRecommendedJobs } from "../hooks/use-recommended-jobs";

const SKELETON_CARDS = ["a", "b", "c", "d"];

export function RecommendedJobsView() {
  const { data, isPending, isError, refetch } = useRecommendedJobs();

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="font-tight text-3xl font-bold text-ink">
          {JOB_MATCHING_MESSAGES.pageTitle}
        </h1>
        <p className="text-base text-text-secondary">
          {JOB_MATCHING_MESSAGES.pageDescription}
        </p>
      </header>

      {isPending && (
        <div aria-busy="true" className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {SKELETON_CARDS.map((id) => (
            <Skeleton key={id} className="h-40 rounded-xl" />
          ))}
        </div>
      )}

      {isError && (
        <div role="alert" className="flex max-w-xl flex-col items-start gap-3 rounded-lg border border-border bg-surface p-4">
          <p className="text-sm text-ink">{JOB_MATCHING_MESSAGES.loadError}</p>
          <Button
            variant="outline"
            onClick={() => {
              void refetch();
            }}
          >
            {JOB_MATCHING_MESSAGES.retry}
          </Button>
        </div>
      )}

      {data && !data.isProfileComplete && <JobsEmptyState variant="incomplete-profile" />}
      
      {data && data.isProfileComplete && data.items.length === 0 && (
        <JobsEmptyState variant="no-matches" />
      )}

      {data && data.items.length > 0 && (
        <>
          <aside className="rounded-lg border border-border bg-surface-soft p-4 text-sm text-ink-soft">
            <strong className="font-semibold text-ink">
              {JOB_MATCHING_MESSAGES.scoreInfoTitle}
            </strong>{" "}
            {JOB_MATCHING_MESSAGES.scoreInfoText}
          </aside>
          
          <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {data.items.map((job) => (
              <li key={job.jobOfferId}>
                <JobRecommendationCard job={job} />
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
