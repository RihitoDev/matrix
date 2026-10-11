"use client";

import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Breadcrumbs } from "@/shared/components/layout";
import { ORIENTATION_CONFIG_BREADCRUMB_ITEMS } from "../constants/orientation-config-breadcrumb.constants";
import {
  getMentorOrientationTypes,
  getOrientationTypes,
  updateMentorOrientationTypes,
} from "../services/orientation-type.service";
import type { OrientationTypeResponse } from "../types/orientation-type-response.types";

export function OrientationConfigView() {
  const [orientationTypes, setOrientationTypes] = useState<
    OrientationTypeResponse[]
  >([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasLoadError, setHasLoadError] = useState(false);
  const [isMentorActive, setIsMentorActive] = useState(true);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    Promise.allSettled([
      getOrientationTypes(controller.signal),
      getMentorOrientationTypes(controller.signal),
    ])
      .then(([catalogResult, selectedOrientationsResult]) => {
        if (controller.signal.aborted) return;

        if (catalogResult.status === "rejected") {
          setHasLoadError(true);
          return;
        }

        if (selectedOrientationsResult.status === "rejected") {
          const error: unknown = selectedOrientationsResult.reason;

          if (axios.isAxiosError(error) && error.response?.status === 404) {
            setIsMentorActive(false);
            return;
          }

          setHasLoadError(true);
          return;
        }

        const ids = selectedOrientationsResult.value.map(
          (orientation) => orientation.id,
        );
        setOrientationTypes(catalogResult.value);
        setSelectedIds(ids);
        setIsMentorActive(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [loadAttempt]);

  const handleCheckboxChange = (id: string) => {
    setErrorMessage(null);
    setShowToast(false);
    setSelectedIds((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id],
    );
  };

  const handleSave = async () => {
    if (selectedIds.length === 0) {
      setErrorMessage(
        "Debe seleccionar al menos un tipo de orientación antes de guardar.",
      );
      return;
    }

    setIsSaving(true);
    setShowToast(false);
    try {
      await updateMentorOrientationTypes(selectedIds);
      setErrorMessage(null);
      setShowToast(true);
    } catch {
      setErrorMessage(
        "No se pudieron guardar los cambios. Intente nuevamente.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-full bg-background px-4 py-8 sm:px-8">
        <Card
          className="mx-auto max-w-3xl gap-0 rounded-xl border border-gray-100 bg-white py-0 shadow-sm ring-0"
          aria-busy="true"
        >
          <CardHeader className="gap-0 p-6 sm:p-8">
            <CardTitle
              role="heading"
              aria-level={1}
              className="text-2xl font-bold tracking-tight text-ink"
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
      <main className="min-h-full bg-background px-4 py-8 sm:px-8">
        <Card className="mx-auto max-w-3xl gap-0 rounded-xl border border-gray-100 bg-white py-0 shadow-sm ring-0">
          <CardHeader className="gap-0 p-6 pb-0 sm:p-8 sm:pb-0">
            <CardTitle
              role="heading"
              aria-level={1}
              className="text-2xl font-bold tracking-tight text-ink"
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
                  "h-10 rounded-lg bg-red-600 px-6 text-sm font-semibold text-white hover:bg-red-700 active:translate-y-0",
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
        <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-6 px-4 py-8 sm:px-8">
          <Breadcrumbs items={ORIENTATION_CONFIG_BREADCRUMB_ITEMS} />

          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight text-ink">
              Editar tipos de orientación
            </h1>
            <p className="pl-2 text-sm text-text-secondary">
              Selecciona los tipos de orientación que deseas brindar.
            </p>
          </div>

          <Card className="w-full max-w-3xl gap-6 rounded-xl border border-gray-100 bg-white py-0 shadow-sm ring-0">
            <CardContent className="flex flex-col gap-6 px-4 pt-4 sm:px-8 sm:pt-8">
              {hasLoadError && (
                <Alert className="flex items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <span>No se pudieron cargar los tipos de orientación.</span>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsLoading(true);
                      setHasLoadError(false);
                      setLoadAttempt((attempt) => attempt + 1);
                    }}
                  >
                    Reintentar
                  </Button>
                </Alert>
              )}

              {!hasLoadError && errorMessage && (
                <Alert className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <AlertCircle size={20} className="shrink-0 text-red-600" />
                  <span>{errorMessage}</span>
                </Alert>
              )}

              {!hasLoadError && (
                <div className="flex flex-col gap-3">
                  {orientationTypes.map((option) => {
                    const isSelected = selectedIds.includes(option.id);

                    return (
                      <label
                        key={option.id}
                        className={`group flex cursor-pointer items-center justify-between gap-3 rounded-lg border p-4 transition-colors ${
                          isSelected
                            ? "border-red-200 bg-red-50/50"
                            : "border-transparent bg-gray-50/50 hover:bg-gray-50"
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
                            className="size-5 border-0 bg-gray-200 text-transparent data-checked:bg-red-600 data-checked:text-white [&_[data-slot=checkbox-indicator]>svg]:size-4"
                          />
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </CardContent>
            <CardFooter className="mx-4 flex items-center justify-between gap-4 border-t border-gray-100 bg-transparent px-0 pb-4 pt-4 sm:mx-8 sm:pb-8">
              <Link
                href="/mentors/participation"
                className={buttonVariants({
                  className:
                    "h-10 rounded-lg bg-gray-100 px-6 text-sm font-semibold text-ink hover:bg-gray-200 active:translate-y-0",
                })}
              >
                Volver
              </Link>
              <Button
                type="button"
                onClick={handleSave}
                disabled={selectedIds.length === 0 || isSaving || hasLoadError}
                className="h-10 rounded-lg bg-red-600 px-6 text-sm font-semibold text-white shadow-sm hover:bg-red-700 active:translate-y-0 disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? "Guardando..." : "Guardar cambios"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {showToast && (
        <Alert
          className="fixed right-4 bottom-4 left-4 z-50 flex w-auto items-center gap-3 rounded-xl border-0 bg-gray-900 px-6 py-3 text-white shadow-xl sm:right-8 sm:bottom-8 sm:left-auto"
          role="status"
        >
          <CheckCircle2 size={20} className="text-amber-400" />
          <span className="text-sm font-medium">
            Tipos de orientación actualizados correctamente
          </span>
        </Alert>
      )}
    </div>
  );
}
