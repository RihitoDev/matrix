'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { eventsService } from '../services/events.service';

import type { DetailResult } from '../types/detail-result.types';

export function useEvent(id: string | null) {
  const [result, setResult] = useState<DetailResult | null>(null);
  const [version, setVersion] = useState(0);
  const current =
    result?.id === id && result.version === version ? result : null;

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    eventsService
      .getEvent(id, controller.signal)
      .then((event) => {
        if (!controller.signal.aborted)
          setResult({ id, version, event, error: null, notFound: false });
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        const notFound =
          axios.isAxiosError(cause) && cause.response?.status === 404;
        setResult({
          id,
          version,
          event: null,
          notFound,
          error: notFound
            ? 'El taller ya no está disponible o no existe.'
            : 'No se pudo cargar el detalle del taller. Inténtalo nuevamente.',
        });
      });
    return () => controller.abort();
  }, [id, version]);

  return {
    event: current?.event ?? null,
    isLoading: id !== null && current === null,
    error: current?.error ?? null,
    notFound: current?.notFound ?? false,
    retry: () => setVersion((value) => value + 1),
  };
}
