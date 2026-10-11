"use client";

import { useCallback, useState } from "react";
import { downloadFile } from "@/shared/utils/download-file";
import type { ExportedFile } from "../types/registered-user.types";

export function useExportReportCsv(exportReport: () => Promise<ExportedFile>) {
  const [isExporting, setIsExporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  const exportCsv = useCallback(async () => {
    setIsExporting(true);
    setErrorMessage(undefined);

    try {
      const { file, fileName } = await exportReport();
      downloadFile(file, fileName);
    } catch {
      setErrorMessage("No se pudo exportar el reporte. Inténtalo de nuevo.");
    } finally {
      setIsExporting(false);
    }
  }, [exportReport]);

  return { exportCsv, isExporting, errorMessage };
}
