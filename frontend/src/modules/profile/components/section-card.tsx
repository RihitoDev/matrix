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

export function SectionCard({ title, description, action, children, className }: SectionCardProps) {
  return (
    <Card
      className={cn(
        "gap-6 rounded-2xl border border-border bg-surface py-7 text-ink shadow-none ring-0",
        className,
      )}
    >
      <CardHeader className="gap-2 px-8">
        <span aria-hidden="true" className="mb-1 block h-0.75 w-6.5 bg-gold" />
        <CardTitle className="font-tight text-[22px] font-bold text-ink">{title}</CardTitle>
        {description ? (
          <CardDescription className="text-[15px] text-text-secondary">{description}</CardDescription>
        ) : null}
        {action ? <CardAction className="row-span-3">{action}</CardAction> : null}
      </CardHeader>
      <CardContent className="px-8">{children}</CardContent>
    </Card>
  );
}
