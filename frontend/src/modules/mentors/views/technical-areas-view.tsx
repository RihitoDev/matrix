"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/shared/components/layout";
import { TechnicalAreaCard } from "../components/technical-area-card";
import { TECHNICAL_AREAS_BREADCRUMB_ITEMS } from "../constants/technical-areas-breadcrumb.constants";
import {
  getMentorTechnicalAreas,
  updateMentorTechnicalAreas,
} from "../services/technical-areas.service";
import { getTechnicalAreas } from "@/modules/mentorship/services/technical-area.service";
import type { TechnicalAreaResponse } from "@/modules/mentorship/types/technical-area-response.types";

export function TechnicalAreasView() {
  const router = useRouter();

  const [areas, setAreas] = useState<TechnicalAreaResponse[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadError, setHasLoadError] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
  const [toast, setToast] = useState<{ isError: boolean; text: string } | null>(
    null,
  );

  useEffect(() => {
    const controller = new AbortController();

    Promise.all([
      getTechnicalAreas(controller.signal),
      getMentorTechnicalAreas(controller.signal),
    ])
      .then(([catalog, selectedAreas]) => {
        const ids = selectedAreas.map((area) => area.id);
        setAreas(catalog);
        setSavedIds(ids);
        setSelectedIds(ids);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setHasLoadError(true);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [loadAttempt]);

  const hasChanges =
    selectedIds.length !== savedIds.length ||
    selectedIds.some((id) => !savedIds.includes(id));
  const hasNoSelection = selectedIds.length === 0;

  const handleToggleArea = (id: string) =>
    setSelectedIds((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id],
    );

  const showToast = (isError: boolean, text: string) => {
    setToast({ isError, text });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSubmit = async () => {
    if (hasNoSelection) return;

    setIsSaving(true);
    try {
      await updateMentorTechnicalAreas(selectedIds);
      setSavedIds([...selectedIds]);
      showToast(false, "Áreas técnicas actualizadas correctamente");
    } catch {
      showToast(
        true,
        "No se pudieron guardar los cambios. Intente nuevamente.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleGoBack = () => {
    if (hasChanges) setIsDiscardModalOpen(true);
    else router.push("/mentors/participation");
  };

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-8">
      <Breadcrumbs items={TECHNICAL_AREAS_BREADCRUMB_ITEMS} />

      <h1 className="text-2xl font-bold">Editar áreas técnicas</h1>
      <p className="mb-4 text-gray-600">
        Indica las áreas en las que tienes experiencia y puedes brindar
        orientación.
      </p>

      {!isLoading &&
        !hasLoadError &&
        (hasNoSelection ? (
          <Alert className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            Debe seleccionarse al menos un área para continuar
          </Alert>
        ) : (
          <div className="mb-4 rounded-lg bg-gray-100 p-3 text-sm text-gray-700">
            {selectedIds.length} seleccionadas
          </div>
        ))}

      {isLoading && (
        <p role="status" aria-live="polite" className="py-8 text-center">
          Cargando áreas técnicas...
        </p>
      )}

      {hasLoadError && (
        <Alert className="flex items-center justify-between gap-4 rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
          <span>No se pudieron cargar las áreas técnicas.</span>
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

      {!isLoading && !hasLoadError && (
        <fieldset
          disabled={isSaving}
          className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3"
        >
          {areas.map((area) => (
            <TechnicalAreaCard
              key={area.id}
              area={area}
              isSelected={selectedIds.includes(area.id)}
              onToggle={handleToggleArea}
            />
          ))}
        </fieldset>
      )}

      <div className="mt-6 flex items-center justify-between">
        <Button
          type="button"
          onClick={handleGoBack}
          className="h-auto gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-normal text-black hover:bg-gray-100 active:translate-y-0"
        >
          <ArrowLeft size={16} /> Volver
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={hasNoSelection || isSaving || isLoading || hasLoadError}
          className="h-auto gap-2 rounded-lg bg-[#DC2626] px-6 py-2 font-medium text-white hover:bg-[#DC2626] active:translate-y-0 disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? (
            "Guardando..."
          ) : (
            <>
              <Save size={16} /> Guardar cambios
            </>
          )}
        </Button>
      </div>

      {toast && (
        <Alert
          className={`fixed right-4 bottom-4 w-auto rounded-lg border-0 px-4 py-3 text-white shadow-lg ${
            toast.isError ? "bg-red-600" : "bg-green-600"
          }`}
        >
          {toast.text}
        </Alert>
      )}

      <AlertDialog
        open={isDiscardModalOpen}
        onOpenChange={(open, eventDetails) => {
          if (eventDetails.reason === "close-press") {
            setIsDiscardModalOpen(open);
          }
        }}
      >
        <AlertDialogContent className="w-[calc(100%-2rem)] max-w-sm gap-0 rounded-lg bg-white p-6 ring-0 sm:max-w-sm">
          <AlertDialogHeader className="place-items-start gap-0 text-left">
            <AlertDialogTitle className="mb-2 text-lg font-bold">
              ¿Descartar cambios?
            </AlertDialogTitle>
            <AlertDialogDescription className="mb-4 text-left text-sm text-gray-600 [text-wrap:wrap]">
              Tienes cambios sin guardar. Si sales, se perderán.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="-mx-0 -mb-0 flex-row justify-end gap-2 rounded-none border-0 bg-transparent p-0">
            <AlertDialogCancel
              onClick={() => setIsDiscardModalOpen(false)}
              className="h-auto rounded-lg px-4 py-2 active:translate-y-0"
            >
              Seguir editando
            </AlertDialogCancel>
            <AlertDialogAction
              type="button"
              onClick={() => router.push("/mentors/participation")}
              className="h-auto rounded-lg bg-[#DC2626] px-4 py-2 text-white hover:bg-[#DC2626] active:translate-y-0"
            >
              Descartar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
