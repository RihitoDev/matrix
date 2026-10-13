import type { Registration } from '../types/registration.types';
import { readRecord, readString } from './response-validation';
export function parseRegistration(value: unknown): Registration {
  const registration = readRecord(value);
  return {
    id: readString(registration.id),
    eventName: readString(registration.eventName),
    date: readString(registration.date),
    startTime: readString(registration.startTime),
    endTime: readString(registration.endTime),
    location: readString(registration.location),
    status: readString(registration.status),
  };
}
