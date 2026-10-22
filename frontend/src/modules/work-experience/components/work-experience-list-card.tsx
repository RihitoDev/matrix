import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { WorkExperienceListCardProps } from "../types/work-experience-list-card-props.types";
import { formatWorkPeriod } from "../utils/format-work-period";
import { sortWorkExperiences } from "../utils/sort-work-experiences";
import { SectionCard } from "@/modules/profile";

export function WorkExperienceListCard({
  experiences = [],
  isLoading = false,
  isBusy = false,
  onEdit,
  onDelete,
}: WorkExperienceListCardProps) {
  const sortedExperiences = sortWorkExperiences(experiences);

  const renderContent = () => {
    if (isLoading) {
      return <p className="text-[14px] text-text-secondary">Cargando experiencia laboral...</p>;
    }

    if (sortedExperiences.length === 0) {
      return <p className="text-[14px] text-text-secondary">Aún no registraste experiencia laboral.</p>;
    }

    return (
      <ul className="divide-y divide-border">
        {sortedExperiences.map((experience) => (
          <li key={experience.id} className="flex items-center justify-between gap-4 py-4 first:pt-0">
            <div className="min-w-0 flex-1">
              <h3 className="text-[15px] font-bold text-ink [overflow-wrap:anywhere]">
                {experience.position}
              </h3>
              <p className="mt-0.5 text-[13px] text-text-secondary [overflow-wrap:anywhere]">
                {experience.companyName} ·{" "}
                {formatWorkPeriod(experience.startDate, experience.endDate, experience.isCurrent)}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                aria-label={`Editar ${experience.position}`}
                className="size-9 p-0 text-ink-soft"
                disabled={isBusy}
                onClick={() => onEdit?.(experience)}
              >
                <Pencil className="size-4" aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                aria-label={`Eliminar ${experience.position}`}
                className="size-9 p-0 text-ink-soft hover:bg-interaction hover:text-ink"
                disabled={isBusy}
                onClick={() => onDelete?.(experience)}
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <SectionCard title="Tu experiencia" description="Ordenada de la más reciente a la más antigua.">
      {renderContent()}
      <p className="mt-4 border-t border-border pt-4 text-[13px] text-text-secondary">
        Agrega todos los trabajos relevantes para tu trayectoria.
      </p>
    </SectionCard>
  );
}
