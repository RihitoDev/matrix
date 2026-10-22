"use client";

import Link from "next/link";
import { isApiError } from "@/shared/services/api-client";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MatchScoreBar } from "../components/match-score-bar";
import { MissingRequirements } from "../components/missing-requirements";
import {
  JOB_MATCHING_MESSAGES,
  JOBS_ROUTE,
} from "../constants/job-matching.constants";
import { useJobMatch } from "../hooks/use-job-match";

interface JobMatchDetailViewProps {
  jobOfferId: string;
}

export function JobMatchDetailView({ jobOfferId }: JobMatchDetailViewProps) {
  const { data, error, isPending, isError, refetch } = useJobMatch(jobOfferId);

  const isNotFound = isApiError(error) && error.response?.status === 404;
  const matchedNames = data?.requirements.filter(({ status }) => status === "Cumple").map(({ name }) => name) ?? [];

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header className="flex flex-col gap-2">
        {data && (
          <>
            <h1 className="font-tight text-3xl font-bold text-ink">{data.title}</h1>
            <p className="text-base text-text-secondary">
              {data.companyName} · {data.modality}
            </p>
          </>
        )}
      </header>

      {isPending && <Skeleton aria-busy="true" className="h-72 rounded-xl" />}

      {isError && (
        <div role="alert" className="flex flex-col items-start gap-3 rounded-lg border border-border bg-surface p-4">
          <p className="text-sm text-ink">
            {isNotFound ? JOB_MATCHING_MESSAGES.notFound : JOB_MATCHING_MESSAGES.loadError}
          </p>
          {!isNotFound && (
            <Button
              variant="outline"
              onClick={() => {
                void refetch();
              }}
            >
              {JOB_MATCHING_MESSAGES.retry}
            </Button>
          )}
        </div>
      )}

      {data && (
        <Card className="gap-5 px-5">
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface-soft p-4">
            <div className="flex items-center gap-4">
              <p className="font-tight text-3xl font-bold text-ink">{data.score}%</p>
              <p className="text-sm text-ink-soft">
                {JOB_MATCHING_MESSAGES.scoreCaption}
                {matchedNames.length > 0 && (
                  <span className="block text-text-secondary">
                    según {matchedNames.join(", ")}
                  </span>
                )}
              </p>
            </div>
            <MatchScoreBar score={data.score} showLabel={false} size="sm" />
          </div>

          <MissingRequirements requirements={data.requirements} />

          <section className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-ink">
              {JOB_MATCHING_MESSAGES.descriptionTitle}
            </h3>
            <p className="whitespace-pre-line text-sm text-ink-soft">{data.description}</p>
          </section>
        </Card>
      )}

      <div>
        <Link href={JOBS_ROUTE} className={buttonVariants({ variant: "outline", size: "lg" })}>
          {JOB_MATCHING_MESSAGES.back}
        </Link>
      </div>
    </section>
  );
}
