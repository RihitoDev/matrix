import { Badge } from "@/components/ui/badge";
import type { ReviewProfileStatus } from "../types/review-queue.types";

interface ReviewStatusBadgeProps {
  status: ReviewProfileStatus;
}

function getStatusClasses(status: ReviewProfileStatus): string {
  switch (status) {
    case "Completado":
      return "border-transparent text-ink";

    case "Procesando":
      return "border-transparent text-ink-soft";

    case "Pendiente":
      return "border-transparent text-text-secondary";
  }
}

export function ReviewStatusBadge({
  status,
}: ReviewStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={getStatusClasses(status)}
    >
      {status}
    </Badge>
  );
}