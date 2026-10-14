import { Terminal } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { MentorProfile } from "../../types/mentor-profile.types";

type MentorTechnicalAreasProps = {
  areas: MentorProfile["technicalAreas"];
};

export function MentorTechnicalAreas({ areas }: MentorTechnicalAreasProps) {
  return (
    <Card className="gap-0 overflow-visible rounded-xl border border-border bg-white py-0 text-base shadow-sm ring-0">
      <CardHeader className="px-6 pt-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-soft text-ink">
            <Terminal size={20} />
          </div>

          <CardTitle
            role="heading"
            aria-level={2}
            className="text-xl font-bold text-ink"
          >
            Áreas técnicas
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="px-6 pb-6 pt-5">
        {areas.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {areas.map((area) => (
              <span
                key={area.id}
                className="min-w-0 max-w-full [overflow-wrap:anywhere] rounded-lg border border-border bg-surface-soft px-4 py-2 text-sm font-medium text-ink"
              >
                {area.name}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-secondary">
            No hay áreas técnicas registradas.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
