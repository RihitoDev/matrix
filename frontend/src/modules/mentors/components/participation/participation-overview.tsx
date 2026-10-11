import Link from "next/link";
import { Check, Pencil } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Breadcrumbs } from "@/shared/components/layout";
import { PARTICIPATION_BREADCRUMB_ITEMS } from "../../constants/participation-breadcrumb.constants";

type ParticipationOverviewProps = {
  areas: string[];
  orientations: string[];
};

type ParticipationPreferencesCardProps = {
  title: string;
  editHref: string;
  editLabel: string;
  items: string[];
};

function ParticipationPreferencesCard({
  title,
  editHref,
  editLabel,
  items,
}: ParticipationPreferencesCardProps) {
  return (
    <Card className="gap-0 overflow-visible rounded-lg border border-border bg-surface py-0 text-base shadow-sm ring-0">
      <CardHeader className="px-5 pt-5 sm:px-6 sm:pt-6">
        <div className="flex items-center justify-between gap-4">
          <CardTitle
            role="heading"
            aria-level={2}
            className="text-base font-semibold text-ink"
          >
            {title}
          </CardTitle>

          <Link
            href={editHref}
            className={buttonVariants({
              className:
                "h-auto gap-2 rounded-md bg-surface-soft px-3 py-2 text-xs font-semibold text-ink hover:bg-border active:translate-y-0",
            })}
          >
            <Pencil size={14} /> {editLabel}
          </Link>
        </div>
      </CardHeader>

      <CardContent className="px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item}
              className="rounded-md bg-surface-soft px-3 py-1.5 text-xs text-ink"
            >
              {item}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function ParticipationOverview({
  areas,
  orientations,
}: ParticipationOverviewProps) {
  return (
    <main className="min-h-full bg-surface-soft px-4 py-6 sm:py-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <div>
          <div className="[&>nav]:mb-0 [&>nav]:text-xs [&_[aria-current=page]]:font-normal [&_[aria-current=page]]:text-text-secondary">
            <Breadcrumbs items={PARTICIPATION_BREADCRUMB_ITEMS} />
          </div>
          <h1 className="mt-2 text-2xl font-bold text-ink">
            Mi participación como mentor
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Gestiona la información relacionada con tu participación en la red
            de mentorías.
          </p>
        </div>

        <Card className="gap-0 overflow-visible rounded-lg border border-border bg-surface py-0 text-base shadow-sm ring-0">
          <CardHeader className="gap-0 px-5 pt-5 sm:px-6 sm:pt-6">
            <CardTitle
              role="heading"
              aria-level={2}
              className="text-base font-semibold text-ink"
            >
              Estado de participación
            </CardTitle>
            <p className="mt-1 text-sm text-text-secondary">
              Tu perfil puede aparecer como mentor disponible en el directorio.
            </p>
          </CardHeader>

          <CardContent className="px-5 pb-5 pt-3 sm:px-6 sm:pb-6">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              <Check size={13} /> Activo
            </span>
          </CardContent>
        </Card>

        <ParticipationPreferencesCard
          title="Áreas técnicas"
          editHref="/mentors/participation/technical-areas"
          editLabel="Editar áreas técnicas"
          items={areas}
        />

        <ParticipationPreferencesCard
          title="Tipos de orientación"
          editHref="/mentorship/orientation"
          editLabel="Editar tipos de orientación"
          items={orientations}
        />
      </div>
    </main>
  );
}
