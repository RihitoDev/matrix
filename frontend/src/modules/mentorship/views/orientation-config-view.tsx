"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertCircle, CheckCircle2, LoaderCircle } from "lucide-react";
import { Alert } from "@/components/ui/alert";
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
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useOrientationConfig } from "../hooks/use-orientation-config";

export function OrientationConfigView() {
  const { orientationTypes, savedIds, isLoading, isSaving, hasLoadError, isMentorActive, retry, save } = useOrientationConfig();
  const [draftIds, setSelectedIds] = useState<string[] | null>(null);
  const selectedIds = draftIds ?? savedIds;
  const [showToast, setShowToast] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCheckboxChange = (id: string) => {
    setErrorMessage(null);
    setShowToast(false);
    setSelectedIds((previous) =>
      (previous ?? savedIds).includes(id)
        ? (previous ?? savedIds).filter((item) => item !== id)
        : [...(previous ?? savedIds), id],
    );
  };

  const handleSave = async () => {
    if (selectedIds.length === 0) {
      setErrorMessage(
        "Debe seleccionar al menos un tipo de orientación antes de guardar.",
      );
      return;
    }

    setShowToast(false);
    const idsToSave = [...selectedIds];
    try {
      await save(idsToSave);
      setErrorMessage(null);
      setShowToast(true);
    } catch {
      setErrorMessage(
        "No se pudieron guardar los cambios. Intente nuevamente.",
      );
    } finally {
      setIsConfirmModalOpen(false);
    }
  };

  const handleOpenConfirmModal = () => {
    if (selectedIds.length === 0 || isSaving || hasLoadError) return;

    setIsConfirmModalOpen(true);
  };

  if (isLoading) {
    return (
      <main className="mx-auto min-h-full max-w-7xl bg-background">
        <Card
          className="mx-auto max-w-3xl gap-0 rounded-xl border border-border bg-white py-0 shadow-none ring-0"
          aria-busy="true"
        >
          <CardHeader className="gap-0 p-6 sm:p-8">
            <CardTitle
              role="heading"
              aria-level={1}
              className="font-tight text-3xl font-bold tracking-tight text-ink"
            >
              Editar tipos de orientación
            </CardTitle>
            <p role="status" className="mt-3 text-sm text-text-secondary">
              Cargando tu participación como mentor…
            </p>
          </CardHeader>
        </Card>
      </main>
    );
  }

  if (!isMentorActive) {
    return (
      <main className="mx-auto min-h-full max-w-7xl bg-background">
        <Card className="mx-auto max-w-3xl gap-0 rounded-xl border border-border bg-white py-0 shadow-none ring-0">
          <CardHeader className="gap-0 p-6 pb-0 sm:p-8 sm:pb-0">
            <CardTitle
              role="heading"
              aria-level={1}
              className="font-tight text-3xl font-bold tracking-tight text-ink"
            >
              Editar tipos de orientación
            </CardTitle>
            <p className="mt-3 text-sm text-text-secondary">
              Primero debes activar tu participación como mentor para editar los
              tipos de orientación que deseas brindar.
            </p>
          </CardHeader>
          <CardFooter className="mt-6 border-0 bg-transparent p-6 pt-0 sm:p-8 sm:pt-0">
            <Link
              href="/mentorship"
              className={buttonVariants({
                className:
                  "h-10 rounded-lg bg-accent px-6 text-sm font-semibold text-white hover:bg-brand-hover active:translate-y-0",
              })}
            >
              Activar participación como mentor
            </Link>
          </CardFooter>
        </Card>
      </main>
    );
  }

  return (
    <div className="min-h-full w-full bg-background">
      <div className="flex w-full flex-col">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">

          <div className="flex flex-col gap-1">
            <h1 className="font-tight text-3xl font-bold tracking-tight text-ink">
              Editar tipos de orientación
            </h1>
            <p className="text-sm text-text-secondary">
              Selecciona los tipos de orientación que deseas brindar.
            </p>
          </div>

          <Card className="w-full max-w-none gap-6 rounded-xl border border-border bg-white py-0 shadow-none ring-0">
            <CardContent className="flex flex-col gap-6 px-4 pt-4 sm:px-8 sm:pt-8">
              {hasLoadError && (
                <Alert className="flex items-center justify-between gap-4 rounded-lg border border-danger/20 bg-interaction p-4 text-sm text-danger">
                  <span>No se pudieron cargar los tipos de orientación.</span>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSelectedIds(null);
                      retry();
                    }}
                  >
                    Reintentar
                  </Button>
                </Alert>
              )}

              {!hasLoadError && errorMessage && (
                <Alert className="flex items-center gap-3 rounded-lg border border-danger/20 bg-interaction p-4 text-sm text-danger">
                  <AlertCircle size={20} className="shrink-0 text-accent" />
                  <span>{errorMessage}</span>
                </Alert>
              )}

              {!hasLoadError && (
                <div className="flex flex-col gap-3">
                  {orientationTypes.map((option) => {
                    const isSelected = selectedIds.includes(option.id);
                    const isSaved = savedIds.includes(option.id);

                    return (
                      <label
                        key={option.id}
                        className={`group flex cursor-pointer items-center justify-between gap-3 rounded-lg border p-4 transition-colors ${
                          !isSelected
                            ? "border-transparent bg-surface-soft/50 hover:bg-gray-50"
                            : isSaved
                              ? "border-border bg-surface-soft/50"
                              : "border-accent bg-interaction/50"
                        }`}
                      >
                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                          <span
                            id={`orientation-label-${option.id}`}
                            className="min-w-0 break-words text-sm font-semibold text-ink"
                          >
                            {option.name}
                          </span>
                          {option.description && (
                            <span className="text-sm text-text-secondary">
                              {option.description}
                            </span>
                          )}
                        </div>

                        <div className="flex shrink-0 items-center">
                          <Checkbox
                            value={option.id}
                            checked={isSelected}
                            disabled={isSaving}
                            onCheckedChange={() =>
                              handleCheckboxChange(option.id)
                            }
                            aria-labelledby={`orientation-label-${option.id}`}
                            className={`size-5 border-0 bg-border text-transparent data-checked:text-white [&_[data-slot=checkbox-indicator]>svg]:size-4 ${
                              !isSelected
                                ? ""
                                : isSaved
                                  ? "data-checked:bg-ink-soft"
                                  : "data-checked:bg-accent"
                            }`}
                          />
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </CardContent>
            <CardFooter className="mx-4 flex items-center justify-between gap-4 border-t border-border bg-transparent px-0 pb-4 pt-4 sm:mx-8 sm:pb-8">
              <Link
                href="/mentors/participation"
                className={buttonVariants({
                  className:
                    "h-10 rounded-lg bg-surface-soft px-6 text-sm font-semibold text-ink hover:bg-interaction active:translate-y-0",
                })}
              >
                Volver
              </Link>
              <Button
                type="button"
                onClick={handleOpenConfirmModal}
                disabled={selectedIds.length === 0 || isSaving || hasLoadError}
                className="h-10 rounded-lg bg-accent px-6 text-sm font-semibold text-white shadow-none hover:bg-brand-hover active:translate-y-0 disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? "Guardando..." : "Guardar cambios"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      <AlertDialog
        open={isConfirmModalOpen}
        onOpenChange={(open) => {
          if (!isSaving) setIsConfirmModalOpen(open);
        }}
      >
        <AlertDialogContent className="max-w-md gap-0 rounded-2xl border border-border bg-surface p-8 text-ink shadow-none ring-0 data-[size=default]:max-w-md data-[size=default]:sm:max-w-md">
          <AlertDialogHeader className="place-items-start text-left">
            <AlertDialogTitle className="font-tight text-[22px] font-bold text-ink">
              ¿Guardar cambios?
            </AlertDialogTitle>
            <AlertDialogDescription className="mt-2 text-[15px] text-text-secondary">
              Se actualizarán los tipos de orientación que seleccionaste.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mx-0 mb-0 mt-8 flex-row justify-end gap-3 border-t-0 bg-transparent p-0">
            <AlertDialogCancel
              type="button"
              disabled={isSaving}
              className="h-12 border-border-strong bg-surface px-6 text-[14px] font-semibold text-ink hover:bg-surface-soft"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="h-12 bg-accent px-6 text-[14px] font-semibold text-white hover:bg-brand-hover"
            >
              {isSaving ? (
                <LoaderCircle aria-hidden="true" className="animate-spin" />
              ) : null}
              {isSaving ? "Guardando..." : "Sí, guardar cambios"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {showToast && (
        <Alert
          className="fixed right-4 bottom-4 left-4 z-50 flex w-auto items-center gap-3 rounded-xl border-0 bg-ink px-6 py-3 text-white shadow-none sm:right-8 sm:bottom-8 sm:left-auto"
          role="status"
        >
          <CheckCircle2 size={20} className="text-ink-soft" />
          <span className="text-sm font-medium">
            Tipos de orientación actualizados correctamente
          </span>
        </Alert>
      )}
    </div>
  );
}
