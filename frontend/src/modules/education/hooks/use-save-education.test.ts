import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EDUCATION_FEEDBACK_MESSAGES } from "../constants/education-feedback.constants";
import { educationsService } from "../services/educations.service";
import type { EducationItem } from "../types/education-item.types";
import type { EducationPayload } from "../types/education-payload.types";
import { useSaveEducation } from "./use-save-education";

vi.mock("../services/educations.service", () => ({
  educationsService: { createEducation: vi.fn(), updateEducation: vi.fn() },
}));

const PAYLOAD: EducationPayload = {
  institution: "Example University",
  degree: "Computer Science",
  startDate: "2020-02-01",
  endDate: "2025-11-30",
  description: null,
};

const RECORD: EducationItem = {
  ...PAYLOAD,
  id: "11111111-1111-4111-8111-111111111111",
  createdAt: "2025-12-01T00:00:00.000Z",
  updatedAt: "2025-12-01T00:00:00.000Z",
};

describe("useSaveEducation", () => {
  afterEach(() => {
    cleanup();
    vi.resetAllMocks();
  });

  it("creates a record and notifies the view only after success", async () => {
    vi.mocked(educationsService.createEducation).mockResolvedValue(RECORD);
    const onSaved = vi.fn();
    const { result } = renderHook(() => useSaveEducation(onSaved));

    await act(async () => { await result.current.save(PAYLOAD); });

    expect(educationsService.createEducation).toHaveBeenCalledExactlyOnceWith(PAYLOAD);
    expect(educationsService.updateEducation).not.toHaveBeenCalled();
    expect(onSaved).toHaveBeenCalledOnce();
    expect(result.current.feedback).toEqual({ type: "success", message: EDUCATION_FEEDBACK_MESSAGES.createSuccess });
    expect(result.current.isSaving).toBe(false);
  });

  it("updates the selected record instead of creating another one", async () => {
    vi.mocked(educationsService.updateEducation).mockResolvedValue(RECORD);
    const onSaved = vi.fn();
    const { result } = renderHook(() => useSaveEducation(onSaved));

    await act(async () => { await result.current.save(PAYLOAD, RECORD.id); });

    expect(educationsService.updateEducation).toHaveBeenCalledExactlyOnceWith(RECORD.id, PAYLOAD);
    expect(educationsService.createEducation).not.toHaveBeenCalled();
    expect(onSaved).toHaveBeenCalledOnce();
    expect(result.current.feedback?.message).toBe(EDUCATION_FEEDBACK_MESSAGES.updateSuccess);
  });

  it.each([false, true])("keeps the view unchanged when saving fails (editing: %s)", async (editing) => {
    const error = new Error("Internal server error");
    vi.mocked(educationsService.createEducation).mockRejectedValue(error);
    vi.mocked(educationsService.updateEducation).mockRejectedValue(error);
    const onSaved = vi.fn();
    const { result } = renderHook(() => useSaveEducation(onSaved));

    await act(async () => {
      if (editing) await result.current.save(PAYLOAD, RECORD.id);
      else await result.current.save(PAYLOAD);
    });

    expect(onSaved).not.toHaveBeenCalled();
    expect(result.current.isSaving).toBe(false);
    expect(result.current.feedback).toEqual({
      type: "error",
      message: editing ? EDUCATION_FEEDBACK_MESSAGES.updateError : EDUCATION_FEEDBACK_MESSAGES.createError,
    });
    act(() => result.current.clearFeedback());
    expect(result.current.feedback).toBeNull();
  });

  it("ignores duplicate saves until both the request and list reload finish", async () => {
    let finishRequest!: (record: EducationItem) => void;
    let finishReload!: () => void;
    const request = new Promise<EducationItem>((resolve) => { finishRequest = resolve; });
    const reload = new Promise<void>((resolve) => { finishReload = resolve; });
    vi.mocked(educationsService.createEducation).mockReturnValue(request);
    const onSaved = vi.fn(() => reload);
    const { result } = renderHook(() => useSaveEducation(onSaved));
    let firstSave!: Promise<void>;

    act(() => {
      firstSave = result.current.save(PAYLOAD);
      void result.current.save(PAYLOAD);
    });
    expect(result.current.isSaving).toBe(true);
    expect(educationsService.createEducation).toHaveBeenCalledOnce();

    await act(async () => { finishRequest(RECORD); });
    expect(onSaved).toHaveBeenCalledOnce();
    expect(result.current.isSaving).toBe(true);
    await act(async () => { await result.current.save(PAYLOAD, RECORD.id); });
    expect(educationsService.updateEducation).not.toHaveBeenCalled();

    await act(async () => {
      finishReload();
      await firstSave;
    });
    expect(result.current.isSaving).toBe(false);

    await act(async () => { await result.current.save(PAYLOAD); });
    expect(educationsService.createEducation).toHaveBeenCalledTimes(2);
  });

  it("preserves the view and reports a conflict without automatic retries", async () => {
    vi.mocked(educationsService.updateEducation).mockRejectedValue({ response: { status: 409 } });
    const onSaved = vi.fn();
    const { result } = renderHook(() => useSaveEducation(onSaved));
    await act(async () => { await result.current.save(PAYLOAD, RECORD.id); });
    expect(result.current.feedback).toEqual({ type: "error", message: EDUCATION_FEEDBACK_MESSAGES.updateConflict });
    expect(result.current.isSaving).toBe(false);
    expect(onSaved).not.toHaveBeenCalled();
    expect(educationsService.updateEducation).toHaveBeenCalledTimes(1);
  });
});
