"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { ConfirmDeleteDialog } from "@/modules/profile/components/confirm-delete-dialog";
import { CvUploadCard } from "../components/cv-upload-card";
import { FeedbackMessage } from "@/modules/profile/components/feedback-message";
import { ProfilePageLayout } from "@/modules/profile/components/profile-page-layout";
import { SavedCvCard } from "../components/saved-cv-card";
import { CV_ERROR_MESSAGES } from "../constants/cv-error-messages.constants";
import { CV_FILE_INPUT_ACCEPT } from "../constants/cv-upload.constants";
import { useCvDocument } from "../hooks/use-cv-document";
import type { Feedback } from "@/modules/profile/types/feedback.types";
import { getCvErrorMessage } from "../utils/get-cv-error-message";
import { isCvFileRejection } from "../utils/is-cv-file-rejection";
import { validateCvFile } from "../utils/validate-cv-file";

export function DocumentsCvView() {
  const { savedCv, isLoading, loadError, uploadCv, deleteCv } = useCvDocument();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isBusy = isUploading || isDeleting;
  const visibleFeedback: Feedback | null =
    feedback ?? (loadError ? { type: "error", message: loadError } : null);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    const validationError = validateCvFile(file);

    if (validationError) {
      setSelectedFile(null);
      setFeedback({ type: "error", message: validationError });
      return;
    }

    setFeedback(null);
    setSelectedFile(file);
  };

  const handleConfirmUpload = async (file: File) => {
    const isReplacing = savedCv !== null;
    setFeedback(null);
    setIsUploading(true);

    try {
      await uploadCv(file);
      setSelectedFile(null);
      setFeedback({
        type: "success",
        message: isReplacing ? "Tu CV se reemplazó correctamente." : "Tu CV se cargó correctamente.",
      });
    } catch (error) {
      if (isCvFileRejection(error)) {
        setSelectedFile(null);
      }
      setFeedback({ type: "error", message: getCvErrorMessage(error, CV_ERROR_MESSAGES.upload) });
    } finally {
      setIsUploading(false);
    }
  };

  const openDeleteDialog = () => {
    setFeedback(null);
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);

    try {
      await deleteCv();
      setFeedback({ type: "success", message: "Tu CV se eliminó." });
    } catch (error) {
      setFeedback({ type: "error", message: getCvErrorMessage(error, CV_ERROR_MESSAGES.delete) });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <ProfilePageLayout
      activeTab="documents"
      title="Currículum Vitae"
      description="Sube tu CV para tenerlo disponible en el perfil y mantenerlo actualizado"
    >
      {visibleFeedback ? <FeedbackMessage feedback={visibleFeedback} /> : null}
      <Input
        ref={fileInputRef}
        type="file"
        accept={CV_FILE_INPUT_ACCEPT}
        aria-label="Archivo PDF del CV"
        className="hidden"
        onChange={handleFileChange}
      />
      <div className="grid grid-cols-2 items-start gap-6">
        <CvUploadCard
          selectedFile={selectedFile}
          isUploading={isUploading}
          isBusy={isBusy}
          onSelectFile={openFilePicker}
          onConfirmUpload={handleConfirmUpload}
        />
        <SavedCvCard
          savedCv={savedCv}
          isLoading={isLoading}
          isBusy={isBusy}
          onReplace={openFilePicker}
          onDelete={openDeleteDialog}
        />
      </div>
      <ConfirmDeleteDialog
        isOpen={isDeleteDialogOpen}
        title="¿Eliminar tu CV?"
        message="El archivo dejará de estar disponible en tu perfil."
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={closeDeleteDialog}
      />
    </ProfilePageLayout>
  );
}
