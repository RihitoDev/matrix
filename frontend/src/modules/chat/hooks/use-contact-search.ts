"use client";

import { useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";
import { searchUsers } from "../services/chat-api";

const MIN_SEARCH_CHARS = 2;
const DEBOUNCE_MS = 300;

export function useContactSearch(searchTerm: string) {
  const cleanTerm = searchTerm.trim();
  const term = useDebouncedValue(cleanTerm, DEBOUNCE_MS);
  const canSearch = cleanTerm.length >= MIN_SEARCH_CHARS && term === cleanTerm;
  const query = useQuery({
    queryKey: ["chat", "contacts", term],
    queryFn: ({ signal }) => {
      signal.throwIfAborted();
      return searchUsers(term);
    },
    enabled: canSearch,
  });
  return { results: canSearch ? query.data ?? [] : [], isSearching: canSearch && query.isFetching };
}
