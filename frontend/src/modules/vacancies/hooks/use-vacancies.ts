"use client";

import { useMemo, useState } from "react";
import { vacancies } from "../data/vacancies";

export function useVacancies() {
  const [search, setSearch] = useState("");

  const filteredVacancies = useMemo(() => {
    const searchTerm = search.toLowerCase().trim();

    if (!searchTerm) {
      return vacancies;
    }

    return vacancies.filter((vacancy) => {
      const searchableText = [
        vacancy.cargo,
        vacancy.empresa,
        vacancy.descripcion,
        vacancy.ubicacion,
        vacancy.tipoContrato,
        vacancy.jornada,
        ...vacancy.requisitos,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(searchTerm);
    });
  }, [search]);

  return {
    search,
    setSearch,
    filteredVacancies,
  };
}
