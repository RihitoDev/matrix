import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { PageHeading } from "@/shared/components/layout/page-heading";
export function ParticipationEmptyState() {
 return <main className="mx-auto w-full max-w-7xl space-y-6"><PageHeading title="Mi participación" /><section className="flex flex-wrap items-center justify-between gap-8 rounded-lg border border-border bg-surface p-8"><div className="flex max-w-2xl items-start gap-5"><Users className="size-9 shrink-0 text-accent" aria-hidden="true" /><p className="text-sm leading-relaxed text-ink-soft">Completa el formulario para participar como mentor y elegir tus áreas técnicas y tipos de orientación.</p></div><Link href="/mentorship" className={buttonVariants()}>Participa como mentor<ArrowRight aria-hidden="true" /></Link></section></main>;
}
