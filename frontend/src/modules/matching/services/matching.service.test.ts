import { describe, expect, it } from "vitest";

import type { AxisScores } from "../types/matching-types";
import {
  computeGaps,
  computeMatchPercent,
  getAffinityAxes,
  getCandidatesForVacancy,
  getVacancies,
  getVacancyById,
} from "./matching.service";

const ZERO_SCORES: AxisScores = {
  desarrollo: 0,
  "cloud-devops": 0,
  "data-ai": 0,
  qa: 0,
  ciberseguridad: 0,
  "gobernanza-ti": 0,
};

const MAX_SCORES: AxisScores = {
  desarrollo: 10,
  "cloud-devops": 10,
  "data-ai": 10,
  qa: 10,
  ciberseguridad: 10,
  "gobernanza-ti": 10,
};

describe("matching.service", () => {
  it("devuelve los seis ejes de afinidad", () => {
    const axes = getAffinityAxes();

    expect(axes).toHaveLength(6);

    expect(axes.map((axis) => axis.id)).toEqual([
      "desarrollo",
      "cloud-devops",
      "data-ai",
      "qa",
      "ciberseguridad",
      "gobernanza-ti",
    ]);
  });

  it("devuelve las vacantes disponibles", () => {
    const vacancies = getVacancies();

    expect(vacancies).toHaveLength(3);
    expect(vacancies.map((vacancy) => vacancy.id)).toContain(
      "vac-tech-lead",
    );
  });

  it("encuentra una vacante por su identificador", () => {
    const vacancy = getVacancyById("vac-tech-lead");

    expect(vacancy).not.toBeNull();
    expect(vacancy?.title).toBe("Tech Lead");
  });

  it("devuelve null cuando la vacante no existe", () => {
    expect(getVacancyById("vacante-inexistente")).toBeNull();
  });

  it("calcula 100 por ciento de afinidad para perfiles idénticos", () => {
    expect(computeMatchPercent(MAX_SCORES, MAX_SCORES)).toBe(100);
  });

  it("calcula 0 por ciento para perfiles completamente opuestos", () => {
    expect(computeMatchPercent(ZERO_SCORES, MAX_SCORES)).toBe(0);
  });

  it("calcula correctamente las brechas entre candidato y objetivo", () => {
    const candidate: AxisScores = {
      desarrollo: 8,
      "cloud-devops": 5,
      "data-ai": 9,
      qa: 4,
      ciberseguridad: 7,
      "gobernanza-ti": 6,
    };

    const target: AxisScores = {
      desarrollo: 6,
      "cloud-devops": 7,
      "data-ai": 9,
      qa: 5,
      ciberseguridad: 4,
      "gobernanza-ti": 6.5,
    };

    expect(computeGaps(candidate, target)).toEqual({
      desarrollo: 2,
      "cloud-devops": -2,
      "data-ai": 0,
      qa: -1,
      ciberseguridad: 3,
      "gobernanza-ti": -0.5,
    });
  });

  it("filtra candidatos por nombre", () => {
    const candidates = getCandidatesForVacancy(
      "vac-tech-lead",
      "Carlos",
    );

    expect(candidates).toHaveLength(1);
    expect(candidates[0].name).toContain("Carlos");
  });

  it("ordena candidatos de mayor a menor afinidad", () => {
    const candidates = getCandidatesForVacancy("vac-tech-lead");

    for (let index = 1; index < candidates.length; index += 1) {
      expect(
        candidates[index - 1].matchPercent,
      ).toBeGreaterThanOrEqual(candidates[index].matchPercent);
    }
  });

  it("devuelve una lista vacía para una vacante inexistente", () => {
    expect(
      getCandidatesForVacancy("vacante-inexistente"),
    ).toEqual([]);
  });
});