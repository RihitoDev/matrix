import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type MentorshipActivatedSummaryProps = {
  technicalAreaNames: string[];
  orientationLabels: string[];
};

export function MentorshipActivatedSummary({
  technicalAreaNames,
  orientationLabels,
}: MentorshipActivatedSummaryProps) {
  return (
    <main className="min-h-full bg-surface-soft px-4 py-6 sm:py-8">
      <Card className="mx-auto w-full max-w-4xl gap-6 overflow-visible rounded-lg border border-border bg-surface py-0 shadow-sm ring-0">
        <CardHeader className="gap-0 px-4 pt-4 sm:px-6 sm:pt-6">
          <CardTitle
            role="heading"
            aria-level={1}
            className="font-tight text-xl font-bold text-ink sm:text-2xl"
          >
            Tu participación como mentor está activa
          </CardTitle>

          <p className="mt-2 text-sm text-text-secondary">
            Tu configuración fue registrada correctamente.
          </p>
        </CardHeader>

        <CardContent className="flex flex-col gap-6 px-4 sm:px-6">
          <Card className="gap-0 overflow-visible rounded-lg border border-border bg-surface-soft py-0 shadow-none ring-0">
            <CardHeader className="px-4 pt-4">
              <CardTitle
                role="heading"
                aria-level={2}
                className="text-sm font-semibold text-ink"
              >
                Áreas técnicas
              </CardTitle>
            </CardHeader>

            <CardContent className="mt-3 flex flex-wrap gap-2 px-4 pb-4">
              {technicalAreaNames.map((areaName) => (
                <span
                  key={areaName}
                  className="rounded-full border border-border bg-surface px-3 py-1 text-sm text-ink"
                >
                  {areaName}
                </span>
              ))}
            </CardContent>
          </Card>

          <Card className="gap-0 overflow-visible rounded-lg border border-border bg-surface-soft py-0 shadow-none ring-0">
            <CardHeader className="px-4 pt-4">
              <CardTitle
                role="heading"
                aria-level={2}
                className="text-sm font-semibold text-ink"
              >
                Tipos de orientación
              </CardTitle>
            </CardHeader>

            <CardContent className="mt-3 flex flex-wrap gap-2 px-4 pb-4">
              {orientationLabels.map((orientationLabel) => (
                <span
                  key={orientationLabel}
                  className="rounded-full border border-border bg-surface px-3 py-1 text-sm text-ink"
                >
                  {orientationLabel}
                </span>
              ))}
            </CardContent>
          </Card>
        </CardContent>

        <CardFooter className="border-0 bg-transparent px-4 pb-4 pt-0 sm:px-6 sm:pb-6">
          <Link
            href="/mentorship/mentors"
            className={buttonVariants({
              className:
                "h-auto w-full rounded-md bg-accent px-5 py-2.5 text-center text-sm font-semibold text-white hover:bg-accent active:translate-y-0",
            })}
          >
            Ir al directorio
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
