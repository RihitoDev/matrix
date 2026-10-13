import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { skillsService } from "@/modules/skills/services/skills.service";
import { DOCKER, PYTHON } from "../testing/vacancy-fixtures";
import { useSkillsCatalog } from "./use-skills-catalog";

vi.mock("@/modules/skills/services/skills.service", () => ({ skillsService: { getCatalog: vi.fn() } }));

describe("useSkillsCatalog", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("carga el catálogo y pasa de loading a ready", async () => {
    vi.mocked(skillsService.getCatalog).mockResolvedValue([PYTHON, DOCKER]);

    const { result } = renderHook(() => useSkillsCatalog());
    expect(result.current.status).toBe("loading");

    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.skills).toEqual([PYTHON, DOCKER]);
  });

  it("informa el error y permite reintentar", async () => {
    vi.mocked(skillsService.getCatalog).mockRejectedValueOnce(new Error("network"));
    vi.mocked(skillsService.getCatalog).mockResolvedValueOnce([PYTHON]);

    const { result } = renderHook(() => useSkillsCatalog());
    await waitFor(() => expect(result.current.status).toBe("error"));

    act(() => result.current.reload());
    expect(result.current.status).toBe("loading");

    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.skills).toEqual([PYTHON]);
  });
});
