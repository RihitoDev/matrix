"use client";
import { useQuery } from "@tanstack/react-query";
import { eventsService } from "../services/events.service";
import type { GetEventsParams } from "../types/event.types";
export function usePublicEvents(params: GetEventsParams) {
  return useQuery({ queryKey: ["public-events", params], queryFn: ({ signal }) => eventsService.getEvents(params, signal), staleTime: 60_000 });
}
export function usePublicEvent(id: string) {
  return useQuery({ queryKey: ["public-event", id], queryFn: ({ signal }) => eventsService.getEvent(id, signal), retry: false });
}
