"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { JOB_MATCHING_MESSAGES, JOBS_ROUTE } from "../constants/job-matching.constants";
import type { RecommendedJob } from "../types/job-matching.types";

interface JobRecommendationCardProps {
  job: RecommendedJob;
}

export function JobRecommendationCard({ job }: JobRecommendationCardProps) {
  const pendingSkills = job.skills.filter((skill) => !job.matchedSkills.includes(skill));

  return (
    <Card className="h-full gap-3 px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-tight text-lg font-bold text-ink">{job.title}</h2>
          <p className="text-sm text-text-secondary">
            {job.companyName} · {job.modality}
          </p>
        </div>
        <p className="shrink-0 text-sm font-semibold text-ink">
          {job.score}% {JOB_MATCHING_MESSAGES.scoreCaption}
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
          {JOB_MATCHING_MESSAGES.matchedLabel}
        </p>
        <ul className="flex flex-wrap gap-2">
          {job.matchedSkills.map((skill) => (
            <li key={skill}>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Check className="size-3" aria-hidden="true" />
                {skill}
              </Badge>
            </li>
          ))}
          {pendingSkills.map((skill) => (
            <li key={skill}>
              <Badge variant="outline">{skill}</Badge>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-auto flex justify-end">
        <Link
          href={`${JOBS_ROUTE}/${job.jobOfferId}`}
          className={cn(buttonVariants({ variant: "link" }), "h-auto p-0 font-bold text-ink")}
        >
          {JOB_MATCHING_MESSAGES.viewJob}
          <span className="sr-only"> {job.title}</span>
        </Link>
      </div>
    </Card>
  );
}
