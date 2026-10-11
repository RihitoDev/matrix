import { CircleAlert, CircleCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FeedbackMessageProps } from "../types/feedback-message-props.types";

export function FeedbackMessage({ feedback }: FeedbackMessageProps) {
  if (!feedback) {
    return null;
  }

  const isError = feedback.type === "error";

  return (
    <div
      role={isError ? "alert" : "status"}
      className={cn("mb-6 flex items-center gap-3 rounded-2xl border px-6 py-4 text-[15px]", isError ? "border-accent/30 bg-interaction text-danger" : "border-border bg-surface text-ink")}
    >
      {isError ? (
        <CircleAlert aria-hidden="true" className="size-5 shrink-0 text-accent" />
      ) : (
        <CircleCheck aria-hidden="true" className="size-5 shrink-0 text-ink-soft" />
      )}
      <p>{feedback.message}</p>
    </div>
  );
}
