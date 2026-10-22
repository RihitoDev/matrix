"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Search, SearchX } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/shared/contexts/auth-context";
import { getWorkspaceTasks } from "@/shared/utils/get-workspace-tasks";
import { Button } from "@/components/ui/button";

export function NavigationSearch() {
  const { roles } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const tasks = getWorkspaceTasks(roles, search);

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsOpen((previous) => !previous);
      }
    }
    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, []);

  return (
    <>
      <Button variant="outline" onClick={() => { setSearch(""); setIsOpen(true); }} className="h-9 w-64 justify-start gap-2 bg-surface-soft text-text-secondary">
        <Search aria-hidden="true" /><span className="flex-1 text-left font-normal">Buscar sección</span><kbd className="text-[11px] font-normal">Ctrl K</kbd>
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="gap-4 sm:max-w-xl">
          <DialogHeader><DialogTitle>¿Qué necesitas hacer?</DialogTitle><DialogDescription>Busca una sección de tu espacio.</DialogDescription></DialogHeader>
          <Input autoFocus aria-label="Buscar sección o tarea" placeholder="Por ejemplo: CV, mentor o reporte" value={search} onChange={(event) => setSearch(event.target.value)} />
          <div className="max-h-80 overflow-y-auto" aria-live="polite">
            {tasks.length ? <ul>{tasks.map((task) => <li key={task.href}><Link href={task.href} onClick={() => setIsOpen(false)} className="flex items-center gap-3 rounded-md px-3 py-3 text-sm hover:bg-interaction"><task.icon className="size-4 text-ink-soft" aria-hidden="true" /><span className="flex-1">{task.label}</span><ArrowUpRight className="size-3.5 text-text-secondary" aria-hidden="true" /></Link></li>)}</ul> : <div className="flex flex-col items-center gap-2 py-8 text-sm text-text-secondary"><SearchX className="size-6" aria-hidden="true" /><p>No hay secciones con ese nombre.</p></div>}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
