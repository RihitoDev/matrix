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
      className={cn("mb-5 flex items-center gap-3 rounded-lg border px-4 py-3 text-sm", isError ? "border-danger/25 bg-surface text-danger" : "border-border bg-surface text-ink")}
    >
      {isError ? (
        <CircleAlert aria-hidden="true" className="size-5 shrink-0 text-danger" />
      ) : (
        <CircleCheck aria-hidden="true" className="size-5 shrink-0 text-ink-soft" />
      )}
      <p>{feedback.message}</p>
    </div>
  );
}
