"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { downloadFile } from "@/shared/utils/download-file";
import { saveFile, selectCsvDestination } from "@/shared/utils/save-file";
import { EXPORT_SUCCESS_MESSAGE, EXPORT_SUCCESS_TOAST_DURATION_MS } from "../constants/reports.constants";
import type { ExportedFile } from "../types/registered-user.types";

export function useExportReportCsv(exportReport: () => Promise<ExportedFile>, suggestedFileName: string) {
  const exportInProgress = useRef(false);
  const [isExporting, setIsExporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [successMessage, setSuccessMessage] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timeoutId = setTimeout(() => setSuccessMessage(undefined), EXPORT_SUCCESS_TOAST_DURATION_MS);

    return () => clearTimeout(timeoutId);
  }, [successMessage]);

  const exportCsv = useCallback(async () => {
    if (exportInProgress.current) return;
    exportInProgress.current = true;
    setIsExporting(true);
    setErrorMessage(undefined);
    setSuccessMessage(undefined);

    try {
      const destination = selectCsvDestination(suggestedFileName);
      let fileHandle;

      if (destination) {
        try {
          fileHandle = await destination;
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError") return;
          throw error;
        }
      }

      const { file, fileName } = await exportReport();
      if (fileHandle) {
        await saveFile(file, fileHandle);
      } else {
        downloadFile(file, fileName);
      }
      setSuccessMessage(EXPORT_SUCCESS_MESSAGE);
    } catch {
      setErrorMessage("No se pudo exportar el reporte. Inténtalo de nuevo.");
    } finally {
      exportInProgress.current = false;
      setIsExporting(false);
    }
  }, [exportReport, suggestedFileName]);

  return { exportCsv, isExporting, errorMessage, successMessage };
}
