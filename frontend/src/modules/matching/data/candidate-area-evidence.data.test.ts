import { calculateGap } from "@/modules/radar-chart/utils/calculate-gap";
import { describe, expect, it } from "vitest";
import { CANDIDATES_POOL, AFFINITY_AXES } from "./matching.data";
import { getCandidateAreaDetail } from "./candidate-area-evidence.data";

describe("HU4: evidencias por candidato y área", () => {
  it("genera un detalle para cada combinación candidato/área usando el puntaje correcto", () => {
    for (const candidate of CANDIDATES_POOL) {
      for (const axis of AFFINITY_AXES) {
        const detail = getCandidateAreaDetail(candidate, axis.id);
        expect(detail.id).toBe(axis.id);
        expect(detail.name).toBe(axis.label);
        expect(detail.score).toBe(candidate.scores[axis.id]);
        expect(detail.gap).toBe(calculateGap(detail.score, detail.globalAverage));
      }
    }
  });

  it("no atribuye a Lucía los cursos y la experiencia de Carlos", () => {
    const lucia = CANDIDATES_POOL.find((candidate) => candidate.id === "cand-lucia-flores")!;
    const carlos = CANDIDATES_POOL.find((candidate) => candidate.id === "cand-carlos-mendoza")!;

    const detailLucia = getCandidateAreaDetail(lucia, "data-ai");
    const detailCarlos = getCandidateAreaDetail(carlos, "data-ai");

    expect(detailLucia.courses[0].name).toBe("Machine learning con Python");
    expect(detailCarlos.courses[0].name).toBe("Fundamentos de machine learning con Python");
    expect(detailLucia.experience[0].role).toBe("Científica de datos");
    expect(detailCarlos.experience[0].role).not.toBe(detailLucia.experience[0].role);
  });

  it("mantiene áreas sin evidencia como vacías en lugar de copiar datos ajenos", () => {
    const mariana = CANDIDATES_POOL.find((candidate) => candidate.id === "cand-mariana-gutierrez")!;
    const detail = getCandidateAreaDetail(mariana, "qa");
    expect(detail.courses).toEqual([]);
    expect(detail.certifications).toEqual([]);
    expect(detail.experience).toEqual([]);
  });

  it("asigna números únicamente numéricos de demostración a los seis candidatos", () => {
    const uniqueNumbers = new Set(CANDIDATES_POOL.map((candidate) => candidate.demoPhone));
    expect(uniqueNumbers.size).toBe(CANDIDATES_POOL.length);
    CANDIDATES_POOL.forEach((candidate) => {
      expect(candidate.demoPhone).toMatch(/^\+591 7\d{3} \d{4}$/);
    });
  });
});
