import { Badge } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type MentorAboutProps = {
  description: string;
};

export function MentorAbout({ description }: MentorAboutProps) {
  return (
    <Card className="gap-0 overflow-visible rounded-xl border border-border bg-white py-0 text-base shadow-sm ring-0">
      <CardHeader className="px-6 pt-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-interaction text-accent">
            <Badge size={20} />
          </div>

          <CardTitle
            role="heading"
            aria-level={2}
            className="text-xl font-bold text-ink"
          >
            Sobre mí
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="px-6 pb-6 pt-4">
        <p className="leading-7 text-text-secondary">{description}</p>
      </CardContent>
    </Card>
  );
}
