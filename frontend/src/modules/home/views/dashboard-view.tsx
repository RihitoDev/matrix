"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight, Compass, Search, SearchX } from "lucide-react";
import { useAuth } from "@/shared/contexts/auth-context";
import { WORKSPACE_AREAS } from "@/shared/config/workspace-navigation.config";
import { getWorkspaceTasks } from "@/shared/utils/get-workspace-tasks";
import { getRouteRoles } from "@/shared/utils/get-route-roles";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { PageHeading } from "@/shared/components/layout";

export function DashboardView() {
  const { roles } = useAuth();
  const [search, setSearch] = useState("");
  const tasks = getWorkspaceTasks(roles, search);
  const areas = WORKSPACE_AREAS.filter((area) => tasks.some((task) => task.area === area.id));
  const canExploreMentors = roles.some((role) => getRouteRoles("/mentorship/mentors").includes(role));

  return (
    <main className="mx-auto w-full max-w-7xl space-y-7">
      <PageHeading title="¿Qué quieres hacer hoy?" />
      <div className="relative"><Search className="pointer-events-none absolute left-4 top-4 size-5 text-text-secondary" aria-hidden="true" /><Input type="search" aria-label="Buscar una sección o tarea" placeholder="Buscar una sección o una tarea" className="h-13 bg-surface pl-12 pr-4 text-base" value={search} onChange={(event) => setSearch(event.target.value)} /></div>
      {areas.length ? (
        <section aria-label="Tus espacios" className="rounded-lg border border-border bg-surface p-6">
          <div className="grid gap-8 lg:grid-cols-3">
            {areas.map((area) => <section key={area.id} aria-labelledby={`area-${area.id}`} className="min-w-0 lg:border-r lg:border-border lg:pr-6 lg:last:border-0 lg:last:pr-0"><h2 id={`area-${area.id}`} className="mb-4 flex items-center gap-3 text-xl font-bold text-ink"><area.icon className="size-7 text-accent" strokeWidth={1.5} aria-hidden="true" />{area.label}</h2><ul className="divide-y divide-border">{tasks.filter((task) => task.area === area.id).map((task) => <li key={task.href}><Link href={task.href} className="group flex min-h-12 items-center justify-between gap-3 rounded-sm px-1 py-3 text-sm font-medium text-ink transition-colors hover:text-accent"><span>{task.label}</span><ChevronRight className="size-4 shrink-0 text-text-secondary group-hover:text-accent" aria-hidden="true" /></Link></li>)}</ul></section>)}
          </div>
        </section>
      ) : <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-surface px-8 py-12 text-center"><SearchX className="size-8 text-ink-soft" aria-hidden="true" /><h2 className="text-lg font-semibold">No encontramos esa sección</h2><Button variant="outline" onClick={() => setSearch("")}>Limpiar búsqueda</Button></div>}
      {canExploreMentors && !search ? <aside className="flex items-center justify-between gap-6 rounded-lg bg-interaction px-6 py-5"><div className="flex items-center gap-3"><Compass className="size-7 text-accent" strokeWidth={1.5} aria-hidden="true" /><p className="font-semibold text-ink">Encuentra orientación para tu próximo paso</p></div><Link href="/mentorship/mentors" className={buttonVariants({ variant: "outline", className: "shrink-0 border-accent text-accent" })}>Ver mentores<ArrowRight aria-hidden="true" /></Link></aside> : null}
    </main>
  );
}
