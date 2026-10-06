import { useState, useEffect } from 'react';
import { User } from '../types/user.types';
import { searchUsers } from '../services/chat-api';

const MIN_SEARCH_CHARS = 2;
const DEBOUNCE_MS = 300;

export function useContactSearch(searchTerm: string) {
  const [results, setResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const cleanTerm = searchTerm.trim();

  useEffect(() => {
    // Si el termino es muy corto no disparamos la busqueda.
    // El estado visible se deriva mas abajo durante el render.
    if (cleanTerm.length < MIN_SEARCH_CHARS) {
      return;
    }

    let cancelled = false;
    const timer = setTimeout(() => {
      // setIsSearching se llama dentro del callback asincrono,
      // nunca de forma sincrona en el cuerpo del efecto.
      if (cancelled) return;
      setIsSearching(true);

      searchUsers(cleanTerm)
        .then((data) => {
          if (cancelled) return;
          setResults(data);
        })
        .catch((error) => {
          if (cancelled) return;
          console.error('Error al buscar contactos:', error);
          setResults([]);
        })
        .finally(() => {
          if (cancelled) return;
          setIsSearching(false);
        });
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [cleanTerm]);

  // Estado derivado: si el termino es muy corto, la UI ve lista vacia
  // y estado de "no buscando" sin necesidad de setState dentro del efecto.
  const isTooShort = cleanTerm.length < MIN_SEARCH_CHARS;

  return {
    results: isTooShort ? [] : results,
    isSearching: isTooShort ? false : isSearching,
  };
}