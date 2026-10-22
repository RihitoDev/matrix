import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { SectionCardProps } from "../types/section-card-props.types";

export function SectionCard({ title, description, action, children, className, contentClassName }: SectionCardProps) {
  return (
    <Card
      className={cn(
        "gap-5 rounded-lg border border-border bg-surface py-6 text-ink shadow-none ring-0",
        className,
      )}
    >
      <CardHeader className="gap-1.5 px-6">
        <CardTitle className="font-tight text-lg font-bold text-ink">{title}</CardTitle>
        {description ? (
          <CardDescription className="text-sm leading-relaxed text-text-secondary">{description}</CardDescription>
        ) : null}
        {action ? <CardAction className="row-span-2">{action}</CardAction> : null}
      </CardHeader>
      <CardContent className={cn("px-6", contentClassName)}>{children}</CardContent>
    </Card>
  );
}
