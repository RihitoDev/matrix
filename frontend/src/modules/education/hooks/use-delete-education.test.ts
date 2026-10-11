import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { educationsService } from "../services/educations.service";
import type { EducationItem } from "../types/education-item.types";
import { useDeleteEducation } from "./use-delete-education";

vi.mock("../services/educations.service", () => ({
  educationsService: { deleteEducation: vi.fn() },
}));

const RECORD: EducationItem = {
  id: "11111111-1111-4111-8111-111111111111",
  institution: "University",
  degree: "Engineering",
  startDate: "2020-01-01",
  endDate: "2024-01-01",
  description: null,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

describe("useDeleteEducation", () => {
  afterEach(() => {
    cleanup();
    vi.resetAllMocks();
  });

  it("reports failure without reloading and permits retry", async () => {
    vi.mocked(educationsService.deleteEducation)
      .mockRejectedValueOnce(new Error("Server error"))
      .mockResolvedValueOnce();
    const reload = vi.fn();
    const { result } = renderHook(() => useDeleteEducation(reload));
    await act(async () => {
      expect(await result.current.deleteEducation(RECORD)).toBe(false);
    });
    expect(reload).not.toHaveBeenCalled();
    expect(result.current.feedback?.type).toBe("error");
    expect(result.current.isDeleting).toBe(false);
    act(() => result.current.clearFeedback());
    expect(result.current.feedback).toBeNull();
    await act(async () => {
      expect(await result.current.deleteEducation(RECORD)).toBe(true);
    });
    expect(reload).toHaveBeenCalledOnce();
    expect(result.current.feedback?.type).toBe("success");
  });

  it("prevents duplicate requests until deletion and reloading finish", async () => {
    let finishDelete!: () => void;
    let finishReload!: () => void;
    vi.mocked(educationsService.deleteEducation).mockReturnValue(
      new Promise((resolve) => {
        finishDelete = resolve;
      }),
    );
    const reload = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finishReload = resolve;
        }),
    );
    const { result } = renderHook(() => useDeleteEducation(reload));
    let deletion!: Promise<boolean>;
    act(() => {
      deletion = result.current.deleteEducation(RECORD);
      void result.current.deleteEducation(RECORD);
    });
    expect(result.current.isDeleting).toBe(true);
    expect(educationsService.deleteEducation).toHaveBeenCalledExactlyOnceWith(
      RECORD.id,
    );
    await act(async () => {
      finishDelete();
    });
    expect(reload).toHaveBeenCalledOnce();
    expect(result.current.isDeleting).toBe(true);
    await act(async () => {
      expect(await result.current.deleteEducation(RECORD)).toBe(false);
    });
    await act(async () => {
      finishReload();
      expect(await deletion).toBe(true);
    });
    expect(result.current.isDeleting).toBe(false);
    expect(educationsService.deleteEducation).toHaveBeenCalledOnce();
  });
});
