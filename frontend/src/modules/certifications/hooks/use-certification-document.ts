"use client";

import { useState, useEffect, useRef } from "react";
import { CERTIFICATION_DOCUMENT_MESSAGES } from "../config/certification-document.config";
import { certificationsService } from "../services/certifications.service";
import type { CertificationDocumentChange } from "../types/certification-document-change.types";
import type { CertificationDocumentResult } from "../types/certification-document-result.types";
import type { CertificationDocumentPreview } from "../types/certification-document-preview.types";
import type { Certification } from "../types/certification.types";
import type { Feedback } from "@/modules/profile/types/feedback.types";
import type { UploadedDocumentInfo } from "@/modules/profile/types/uploaded-document-info.types";
import { getDocumentFileName } from "../utils/get-document-file-name";
import { isCorruptedFileError } from "../utils/is-corrupted-file-error";
import { getFileFormat } from "../utils/get-file-format";
import { formatIssueDate } from "../utils/format-issue-date";
import { getTodayIsoDate } from "../utils/validate-certification";

const STORAGE_KEY = "certification-documents";

function getFailureMessage(isReplacing: boolean, error: unknown): string {
  if (!isReplacing) {
    return CERTIFICATION_DOCUMENT_MESSAGES.removeError;
  }
  return isCorruptedFileError(error)
    ? CERTIFICATION_DOCUMENT_MESSAGES.corruptedFile
    : CERTIFICATION_DOCUMENT_MESSAGES.uploadError;
}

export function useCertificationDocument() {
  const [isOpening, setIsOpening] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [uploadedInfo, setUploadedInfo] = useState<Record<string, UploadedDocumentInfo>>({});
  const [preview, setPreview] = useState<CertificationDocumentPreview | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  useEffect(
    () => () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUploadedInfo(JSON.parse(stored));
      } catch {}
    }
  }, []);

  async function applyDocumentChange(
    certificationId: string,
    change: CertificationDocumentChange,
  ): Promise<CertificationDocumentResult> {
    if (change.type === "keep") {
      return { ok: true };
    }

    const isReplacing = change.type === "replace";
    setFeedback(null);
    try {
      if (isReplacing && change.file) {
        await certificationsService.uploadDocument(certificationId, change.file);
        setUploadedInfo((current) => {
          const next = {
            ...current,
            [certificationId]: {
              fileName: change.file!.name,
              format: getFileFormat(change.file!.name),
              uploadedAt: formatIssueDate(getTodayIsoDate()),
            },
          };
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          return next;
        });
      } else {
        await certificationsService.deleteDocument(certificationId);
        setUploadedInfo((current) => {
          const next = Object.fromEntries(Object.entries(current).filter(([id]) => id !== certificationId));
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          return next;
        });
      }
      setFeedback({
        type: "success",
        message: isReplacing
          ? CERTIFICATION_DOCUMENT_MESSAGES.uploadSuccess
          : CERTIFICATION_DOCUMENT_MESSAGES.removeSuccess,
      });
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        message: getFailureMessage(isReplacing, error),
      };
    }
  }

  function closeDocument() {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setPreview(null);
  }

  async function openDocument(certification: Certification): Promise<void> {
    setIsOpening(true);
    setFeedback(null);
    try {
      const file = await certificationsService.getDocument(certification.id);
      if (!file) {
        setFeedback({ type: "error", message: CERTIFICATION_DOCUMENT_MESSAGES.notFound });
        return;
      }
      closeDocument();
      const previewUrl = URL.createObjectURL(file);
      previewUrlRef.current = previewUrl;
      setPreview({
        certificationName: certification.name,
        fileName: getDocumentFileName(
          certification.name,
          file.type,
          uploadedInfo[certification.id]?.fileName,
        ),
        file,
        previewUrl,
      });
    } catch {
      setFeedback({ type: "error", message: CERTIFICATION_DOCUMENT_MESSAGES.openError });
    } finally {
      setIsOpening(false);
    }
  }

  function clearFeedback() {
    setFeedback(null);
  }

  return {
    applyDocumentChange,
    openDocument,
    closeDocument,
    preview,
    uploadedInfo,
    isOpening,
    feedback,
    clearFeedback,
  };
}
