"use client";

import { useState } from "react";
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
import { WorkspacePage } from "@/shared/components/layout/workspace-page";
import { Button } from "@/components/ui/button";
import { TechnicalAreaCard } from "../components/technical-area-card";
import { useTechnicalAreas } from "../hooks/use-technical-areas";

export function TechnicalAreasView() {
  const router = useRouter();

  const { areas, savedIds, isSaving, isLoading, hasLoadError, save, retry } = useTechnicalAreas();
  const [draftIds, setSelectedIds] = useState<string[] | null>(null);
  const selectedIds = draftIds ?? savedIds;
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
  const [toast, setToast] = useState<{ isError: boolean; text: string } | null>(null);

  const hasChanges =
    selectedIds.length !== savedIds.length ||
    selectedIds.some((id) => !savedIds.includes(id));
  const hasNoSelection = selectedIds.length === 0;

  const handleToggleArea = (id: string) =>
    setSelectedIds((previous) =>
      (previous ?? savedIds).includes(id)
        ? (previous ?? savedIds).filter((item) => item !== id)
        : [...(previous ?? savedIds), id],
    );

  const showToast = (isError: boolean, text: string) => {
    setToast({ isError, text });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSubmit = async () => {
    if (hasNoSelection) return;

    try {
      await save(selectedIds);
      showToast(false, "Áreas técnicas actualizadas correctamente");
    } catch {
      showToast(
        true,
        "No se pudieron guardar los cambios. Intente nuevamente.",
      );

    }
  };

  const handleGoBack = () => {
    if (hasChanges) setIsDiscardModalOpen(true);
    else router.push("/mentors/participation");
  };

  return (
    <WorkspacePage title="Editar áreas técnicas" description="Indica las áreas en las que puedes brindar orientación.">
      {!isLoading &&
        !hasLoadError &&
        (hasNoSelection ? (
          <Alert className="mb-4 rounded-lg border border-danger/30 bg-interaction p-3 text-sm text-danger">
            Debe seleccionarse al menos un área para continuar
          </Alert>
        ) : (
          <div className="mb-4 rounded-lg bg-surface-soft p-3 text-sm text-ink-soft">
            {selectedIds.length} seleccionadas
          </div>
        ))}

      {isLoading && (
        <p role="status" aria-live="polite" className="py-8 text-center">
          Cargando áreas técnicas...
        </p>
      )}

      {hasLoadError && (
        <Alert className="flex items-center justify-between gap-4 rounded-lg border border-danger/30 bg-interaction p-4 text-danger">
          <span>No se pudieron cargar las áreas técnicas.</span>
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

      {!isLoading && !hasLoadError && (
        <fieldset
          disabled={isSaving}
          className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-2"
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
          className="h-auto gap-2 rounded-lg bg-surface-soft px-4 py-2 text-sm font-normal text-ink hover:bg-surface-soft active:translate-y-0"
        >
          <ArrowLeft size={16} /> Volver
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={hasNoSelection || isSaving || isLoading || hasLoadError}
          className="h-auto gap-2 rounded-lg bg-accent px-6 py-2 font-medium text-white hover:bg-accent active:translate-y-0 disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-50"
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
          className={`fixed right-4 bottom-4 w-auto rounded-lg border-0 px-4 py-3 text-white shadow-none ${
            toast.isError ? "bg-danger" : "bg-ink-soft"
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
            <AlertDialogDescription className="mb-4 text-left text-sm text-text-secondary [text-wrap:wrap]">
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
              className="h-auto rounded-lg bg-accent px-4 py-2 text-white hover:bg-accent active:translate-y-0"
            >
              Descartar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </WorkspacePage>
  );
}
