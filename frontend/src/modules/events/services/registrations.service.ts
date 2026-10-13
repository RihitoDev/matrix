import { parseRegistration } from '../utils/registration-response';
import { readRecord, readArray } from '../utils/response-validation';
import { REQUEST_TIMEOUT_MS } from '../constants/events.constants';
import { apiClient } from '@/shared/services/api-client';
import type { Registration } from '../types/registration.types';

export const registrationsService = {
  async getMine(signal?: AbortSignal): Promise<Registration[]> {
    const token = sessionStorage.getItem('accessToken');
    if (!token)
      throw new Error('Debes iniciar sesión para ver tus inscripciones.');
    if (!apiClient.defaults.baseURL)
      throw new Error('La URL del backend no está configurada.');
    const response = await apiClient.get<{ data: Registration[] }>(
      '/event-registrations/me',
      {
        headers: { Authorization: `Bearer ${token}` },
        signal,
        timeout: REQUEST_TIMEOUT_MS,
      },
    );
    return readArray(readRecord(response.data).data).map(parseRegistration);
  },
};
