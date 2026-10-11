"use client";

import { useState, useEffect } from "react";
import {
  CERTIFICATION_DOCUMENT_MESSAGES,
  DOCUMENT_URL_LIFETIME_MS,
} from "../config/certification-document.config";
import { certificationsService } from "../services/certifications.service";
import type { CertificationDocumentChange } from "../types/certification-document-change.types";
import type { Certification } from "../types/certification.types";
import type { Feedback } from "@/modules/profile/types/feedback.types";
import type { UploadedDocumentInfo } from "@/modules/profile/types/uploaded-document-info.types";
import { getFileFormat } from "../utils/get-file-format";
import { formatIssueDate } from "../utils/format-issue-date";
import { getTodayIsoDate } from "../utils/validate-certification";

const STORAGE_KEY = "certification-documents";

export function useCertificationDocument() {
  const [isSaving, setIsSaving] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [uploadedInfo, setUploadedInfo] = useState<Record<string, UploadedDocumentInfo>>({});

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
  ): Promise<boolean> {
    if (change.type === "keep") {
      return true;
    }

    const isReplacing = change.type === "replace";
    setIsSaving(true);
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
      return true;
    } catch {
      setFeedback({
        type: "error",
        message: isReplacing
          ? CERTIFICATION_DOCUMENT_MESSAGES.uploadError
          : CERTIFICATION_DOCUMENT_MESSAGES.removeError,
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function openDocument(certification: Certification): Promise<void> {
    const documentTab = window.open("", "_blank");
    setIsOpening(true);
    setFeedback(null);
    try {
      const file = await certificationsService.getDocument(certification.id);
      if (!file) {
        documentTab?.close();
        setFeedback({ type: "error", message: CERTIFICATION_DOCUMENT_MESSAGES.notFound });
        return;
      }
      const fileUrl = URL.createObjectURL(file);
      if (documentTab) {
        documentTab.location.href = fileUrl;
      } else {
        window.open(fileUrl, "_blank");
      }
      window.setTimeout(() => URL.revokeObjectURL(fileUrl), DOCUMENT_URL_LIFETIME_MS);
    } catch {
      documentTab?.close();
      setFeedback({ type: "error", message: CERTIFICATION_DOCUMENT_MESSAGES.openError });
    } finally {
      setIsOpening(false);
    }
  }

  function clearFeedback() {
    setFeedback(null);
  }

  return { applyDocumentChange, openDocument, uploadedInfo, isSaving, isOpening, feedback, clearFeedback };
}
