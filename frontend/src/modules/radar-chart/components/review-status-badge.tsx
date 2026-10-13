import { Badge } from "@/components/ui/badge";
import type { ReviewProfileStatus } from "../types/review-queue.types";

interface ReviewStatusBadgeProps {
  status: ReviewProfileStatus;
}

function getStatusClasses(status: ReviewProfileStatus): string {
  switch (status) {
    case "Completado":
      return "border-ink/15 bg-ink text-surface";

    case "Procesando":
      return "border-gold/30 bg-gold/15 text-ink";

    case "Pendiente":
      return "border-accent/20 bg-interaction text-accent";
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