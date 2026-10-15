import Link from "next/link";
import { Briefcase } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { JOB_MATCHING_MESSAGES, PROFILE_SKILLS_ROUTE } from "../constants/job-matching.constants";

interface JobsEmptyStateProps {
  variant: "incomplete-profile" | "no-matches";
}

export function JobsEmptyState({ variant }: JobsEmptyStateProps) {
  const isIncompleteProfile = variant === "incomplete-profile";

  const title = isIncompleteProfile
    ? JOB_MATCHING_MESSAGES.incompleteProfileTitle
    : JOB_MATCHING_MESSAGES.noMatchesTitle;

  const text = isIncompleteProfile
    ? JOB_MATCHING_MESSAGES.incompleteProfileText
    : JOB_MATCHING_MESSAGES.noMatchesText;

  const action = isIncompleteProfile
    ? JOB_MATCHING_MESSAGES.incompleteProfileAction
    : JOB_MATCHING_MESSAGES.noMatchesAction;

  return (
    <div
      role="status"
      className="flex max-w-xl flex-col items-center gap-3 rounded-xl border border-dashed border-border-strong bg-surface px-6 py-10 text-center"
    >
      <div className="flex size-14 items-center justify-center rounded-full bg-surface-soft">
        <Briefcase className="size-6 text-text-secondary" aria-hidden="true" />
      </div>
      <h2 className="font-tight text-lg font-bold text-ink">{title}</h2>
      <p className="text-sm text-text-secondary">{text}</p>
      <Link href={PROFILE_SKILLS_ROUTE} className={buttonVariants({ size: "lg" })}>
        {action}
      </Link>
    </div>
  );
}
