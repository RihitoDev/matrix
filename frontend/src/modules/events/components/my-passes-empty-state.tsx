import Link from 'next/link';
import { ArrowRight, Ticket } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function MyPassesEmptyState() {
  return (
    <section
      aria-labelledby="my-passes-empty-title"
      className="mx-auto flex w-full max-w-2xl flex-col items-center rounded-3xl border border-border bg-surface px-6 py-12 text-center sm:px-10 sm:py-16"
    >
      <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-surface-soft text-ink">
        <Ticket className="size-9" aria-hidden="true" />
      </div>
      <h2
        id="my-passes-empty-title"
        className="text-xl font-bold text-ink sm:text-2xl"
      >
        Aún no tienes inscripciones.
      </h2>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-text-secondary">
        Explora los talleres disponibles. Cuando tengas una inscripción, podrás
        consultar aquí los detalles de tu pase.
      </p>
      <Link
        href="/events"
        className={cn(
          buttonVariants(),
          'mt-7 h-auto min-h-11 max-w-full gap-2 rounded-xl bg-ink px-5 py-3 text-surface whitespace-normal hover:bg-ink/90',
        )}
      >
        Explorar talleres disponibles
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </section>
  );
}
