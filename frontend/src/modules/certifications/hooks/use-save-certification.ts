"use client";

import { useRef } from "react";
import { certificationsService } from "../services/certifications.service";
import type { CertificationDocumentChange } from "../types/certification-document-change.types";
import type { CertificationSaveResult } from "../types/certification-save-result.types";
import type { CreateCertificationDto } from "../types/create-certification-dto.types";
import type { UseSaveCertificationOptions } from "../types/use-save-certification-options.types";
import { useCreateCertification, useUpdateCertification } from "./use-certification-mutations";

const SAVED: CertificationSaveResult = { status: "saved" };
const FAILED: CertificationSaveResult = { status: "failed", fileError: null };

export function useSaveCertification({
  applyDocumentChange,
  onPersisted,
}: UseSaveCertificationOptions) {
  const createMutation = useCreateCertification();
  const updateMutation = useUpdateCertification();
  const orphanIdRef = useRef<string | null>(null);

  async function saveExisting(
    id: string,
    values: CreateCertificationDto,
    change: CertificationDocumentChange,
  ): Promise<CertificationSaveResult> {
    const updated = await updateMutation.mutate({ id, data: values });
    if (!updated) {
      return FAILED;
    }

    onPersisted();
    const result = await applyDocumentChange(id, change);
    if (!result.ok) {
      updateMutation.clearFeedback();
      return { status: "failed", fileError: result.message };
    }

    orphanIdRef.current = null;
    return SAVED;
  }

  async function saveNew(
    values: CreateCertificationDto,
    change: CertificationDocumentChange,
  ): Promise<CertificationSaveResult> {
    const created = await createMutation.mutate(values);
    if (!created) {
      return FAILED;
    }

    const result = await applyDocumentChange(created.id, change);
    if (result.ok) {
      onPersisted();
      return SAVED;
    }

    createMutation.clearFeedback();
    try {
      await certificationsService.deleteCertification(created.id);
    } catch {
      orphanIdRef.current = created.id;
      onPersisted();
    }
    return { status: "failed", fileError: result.message };
  }

  function save(
    editingId: string | null,
    values: CreateCertificationDto,
    change: CertificationDocumentChange,
  ): Promise<CertificationSaveResult> {
    const existingId = editingId ?? orphanIdRef.current;
    return existingId ? saveExisting(existingId, values, change) : saveNew(values, change);
  }

  function reset() {
    orphanIdRef.current = null;
  }

  function clearFeedback() {
    createMutation.clearFeedback();
    updateMutation.clearFeedback();
  }

  return {
    save,
    reset,
    clearFeedback,
    feedback: createMutation.feedback ?? updateMutation.feedback,
  };
}
