"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { PHOTO_ACCEPT } from "../config/file-upload.config";
import type { ProfilePhotoFieldProps } from "../types/profile-photo-field-props.types";
import { ConfirmDeleteDialog } from "./confirm-delete-dialog";
import { ProfileAvatar } from "./profile-avatar";

export function ProfilePhotoField({
  photoUrl,
  previewUrl,
  isUploading = false,
  isDeleting = false,
  error,
  onSelectPhoto,
  onConfirmPhoto,
  onCancelPhoto,
  onDeletePhoto,
}: ProfilePhotoFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const isBusy = isUploading || isDeleting;
  const canSelect = Boolean(onSelectPhoto) && !isBusy;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Reset so the same file can be selected again after an error.
    event.target.value = "";
    if (file && onSelectPhoto) {
      onSelectPhoto(file);
    }
  };

  const handleConfirmDelete = () => {
    setIsDeleteDialogOpen(false);
    onDeletePhoto?.();
  };

  return (
    <div className="flex items-center gap-8 border-b border-border pb-8">
      <ProfileAvatar label="Foto" photoUrl={previewUrl ?? photoUrl} />
      <div className="flex flex-col gap-1">
        <p className="text-[15px] font-semibold text-ink">Fotografía de perfil</p>
        <p className="text-[13px] text-text-secondary">
          {previewUrl
            ? "Vista previa: así se verá tu fotografía. Guárdala para actualizar tu perfil."
            : "Ayuda a que otras personas te reconozcan. Formato JPG o PNG, hasta 5 MB."}
        </p>
        <Input
          ref={inputRef}
          id="profilePhoto"
          type="file"
          accept={PHOTO_ACCEPT}
          aria-label="Seleccionar fotografía de perfil"
          className="hidden"
          disabled={!canSelect}
          onChange={handleChange}
        />
        <div className="mt-3 flex flex-wrap gap-3">
          {previewUrl ? (
            <>
              <Button
                type="button"
                className="h-12 bg-accent px-6 text-[14px] font-semibold text-white hover:bg-danger"
                disabled={isBusy}
                onClick={onConfirmPhoto}
              >
                {isUploading ? "Guardando..." : "Guardar fotografía"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-12 border-border-strong bg-surface px-6 text-[14px] font-semibold text-ink hover:bg-surface-soft"
                disabled={isBusy}
                onClick={onCancelPhoto}
              >
                Cancelar
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                className="h-12 border-border-strong bg-surface px-6 text-[14px] font-semibold text-ink hover:bg-surface-soft"
                disabled={!canSelect}
                onClick={() => inputRef.current?.click()}
              >
                {photoUrl ? "Cambiar fotografía" : "Subir fotografía"}
              </Button>
              {photoUrl && onDeletePhoto ? (
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 border-accent bg-surface px-6 text-[14px] font-semibold text-accent hover:bg-interaction hover:text-accent"
                  disabled={isBusy}
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  {isDeleting ? "Eliminando..." : "Eliminar fotografía"}
                </Button>
              ) : null}
            </>
          )}
        </div>
        {error ? (
          <p role="alert" className={cn("text-[13px] text-danger", "mt-2")}>
            {error}
          </p>
        ) : null}
      </div>
      <ConfirmDeleteDialog
        isOpen={isDeleteDialogOpen}
        title="¿Eliminar tu fotografía?"
        message="Tu perfil volverá a mostrar tus iniciales. Podrás subir otra fotografía cuando quieras."
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
}
