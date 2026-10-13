import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createQueryWrapper } from "@/shared/testing/create-query-wrapper";
import { jobOffersService } from "../services/job-offers.service";
import { DOCKER, PYTHON } from "../testing/vacancy-fixtures";
import { useSkillsCatalog } from "./use-skills-catalog";

vi.mock("../services/job-offers.service", () => ({ jobOffersService: { getSkillCatalog: vi.fn() } }));

describe("useSkillsCatalog", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("carga el catálogo y pasa de loading a ready", async () => {
    vi.mocked(jobOffersService.getSkillCatalog).mockResolvedValue([PYTHON, DOCKER]);

    const { result } = renderHook(() => useSkillsCatalog(), createQueryWrapper());
    expect(result.current.status).toBe("loading");

    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.skills).toEqual([PYTHON, DOCKER]);
  });

  it("informa el error y permite reintentar", async () => {
    vi.mocked(jobOffersService.getSkillCatalog).mockRejectedValueOnce(new Error("network"));
    vi.mocked(jobOffersService.getSkillCatalog).mockResolvedValueOnce([PYTHON]);

    const { result } = renderHook(() => useSkillsCatalog(), createQueryWrapper());
    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.skills).toEqual([]);

    act(() => result.current.reload());

    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.skills).toEqual([PYTHON]);
  });
});
