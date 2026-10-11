"use client";

import { useState } from "react";
import type { MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAccessRequestForm } from "../../contexts/access-request-context";

export function PublicHeader() {
  const router = useRouter();
  const { status, hasData } = useAccessRequestForm();
  const [open, setOpen] = useState(false);

  // TODO: el borrador guardado queda huérfano en el servidor al salir (no hay GET y el id vive en memoria)
  // TODO: interceptar recarga, cierre de pestaña y botón atrás (beforeunload y popstate no son fiables en el App Router)
  function handleLinkClick(event: MouseEvent<HTMLElement>) {
    // En mitad de un envío o una limpieza no se sale ni se abre el diálogo
    if (status !== "idle") {
      event.preventDefault();
      return;
    }
    // Con datos se frena la navegación y se pide confirmación; sin datos el Link navega normal
    if (hasData) {
      event.preventDefault();
      setOpen(true);
    }
  }

  function handleLeave() {
    router.push("/login");
    setOpen(false);
  }

  return (
    <header className="flex justify-end px-6 pt-6 lg:px-16">
      <p className="flex items-center gap-1.5 text-[13.5px] text-text-secondary 2xl:text-base">
        ¿Ya tienes cuenta?
        {/* Button con render={<Link />} pone role="button" al ancla; por eso se usa Link con las clases de buttonVariants */}
        <Link
          href="/login"
          onClick={handleLinkClick}
          className={cn(buttonVariants({ variant: "link" }), "h-auto p-0 text-[13.5px] font-semibold text-ink 2xl:text-base")}
        >
          Iniciar sesión
        </Link>
      </p>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Salir del formulario?</AlertDialogTitle>
            <AlertDialogDescription>Si sales, se perderán los datos ingresados</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button" className="h-[42px] rounded-md px-5 text-[14.5px] 2xl:h-12">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              type="button"
              onClick={handleLeave}
              className="h-[42px] 2xl:h-12 rounded-md bg-ink px-5 text-[14.5px] font-semibold text-surface hover:bg-ink/90"
            >
              Salir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
}
