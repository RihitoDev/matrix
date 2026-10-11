import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ParticipationEmptyState() {
  return (
    <main className="min-h-full bg-surface-soft px-4 py-6 sm:py-8">
      <Card className="mx-auto max-w-4xl gap-0 overflow-visible rounded-lg border border-border bg-surface py-0 text-base shadow-sm ring-0">
        <CardHeader className="gap-0 px-6 pt-6 sm:px-8 sm:pt-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
            UMSSY · Mentorías
          </p>

          <CardTitle
            role="heading"
            aria-level={1}
            className="mt-2 text-2xl font-bold text-ink"
          >
            Mi participación
          </CardTitle>

          <p className="mt-2 max-w-2xl text-sm text-text-secondary">
            Completa el formulario para participar como mentor y elegir tus
            áreas técnicas y tipos de orientación.
          </p>
        </CardHeader>

        <CardFooter className="mt-6 border-0 bg-transparent px-6 pb-6 pt-0 sm:px-8 sm:pb-8">
          <Link
            href="/mentorship"
            className={buttonVariants({
              className:
                "h-auto gap-2 rounded-md bg-accent px-5 py-3 text-sm font-semibold text-white hover:bg-accent active:translate-y-0",
            })}
          >
            Participa como mentor <ChevronRight size={16} />
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
