'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { registrationsService } from '../services/registrations.service';
import type { Registration } from '../types/registration.types';
export function useMyPasses() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    registrationsService
      .getMine(controller.signal)
      .then((items) => {
        if (!controller.signal.aborted) setRegistrations(items);
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        setError(
          axios.isAxiosError(cause) && cause.response?.status === 401
            ? 'La sesión ha expirado. Inicia sesión nuevamente.'
            : cause instanceof Error && !axios.isAxiosError(cause)
              ? cause.message
              : 'No se pudieron cargar tus inscripciones. Inténtalo nuevamente.',
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [reload]);
  return {
    registrations,
    isLoading,
    error,
    retry: () => {
      setError(null);
      setIsLoading(true);
      setReload((value) => value + 1);
    },
  };
}
