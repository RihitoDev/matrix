"use client";

import { useEffect, useState } from "react";
import { requestReviewService } from "../services/request-review.service";

// Descarga el documento con el token y lo expone como URL de objeto; se libera al salir
export function useDocumentUrl(id: string, enabled: boolean) {
  const [result, setResult] = useState<{ id: string; url: string | null; error: string | null } | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let objectUrl: string | null = null;
    requestReviewService.getDocumentBlob(id).then((response) => {
      if (cancelled) return;
      if (response.ok) {
        objectUrl = URL.createObjectURL(response.data);
        setResult({ id, url: objectUrl, error: null });
      } else {
        setResult({ id, url: null, error: response.message });
      }
    });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [id, enabled]);

  const isLoading = enabled && result?.id !== id;
  return { url: result?.id === id ? result.url : null, error: result?.id === id ? result.error : null, isLoading };
}
