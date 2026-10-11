import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MENTORSHIP_WIZARD_DRAFT_STORAGE_KEY } from "../constants/mentorship-wizard.constants";
import { clearMentorshipWizardDraft } from "../services/mentorship-wizard-draft.service";
import { useMentorshipWizard } from "./use-mentorship-wizard";

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  clearMentorshipWizardDraft();
  vi.restoreAllMocks();
});

describe("useMentorshipWizard", () => {
  it("hydrates a stored draft before persisting later changes", async () => {
    const draft = {
      currentStep: 3 as const,
      wantsToParticipate: true,
      selectedTechnicalAreaIds: ["technical-area-1"],
      selectedOrientationTypeIds: ["orientation-type-1"],
    };
    const updatedDraft = {
      currentStep: 4 as const,
      wantsToParticipate: true,
      selectedTechnicalAreaIds: ["technical-area-1"],
      selectedOrientationTypeIds: ["orientation-type-1"],
    };
    localStorage.setItem(
      MENTORSHIP_WIZARD_DRAFT_STORAGE_KEY,
      JSON.stringify(draft),
    );
    const setItem = vi.spyOn(Storage.prototype, "setItem");

    const { result } = renderHook(() => useMentorshipWizard());

    await waitFor(() => {
      expect(result.current.currentStep).toBe(3);
    });

    expect(result.current.wantsToParticipate).toBe(true);
    expect(result.current.selectedTechnicalAreaIds).toEqual([
      "technical-area-1",
    ]);
    expect(result.current.selectedOrientationTypeIds).toEqual([
      "orientation-type-1",
    ]);
    expect(setItem).not.toHaveBeenCalledWith(
      MENTORSHIP_WIZARD_DRAFT_STORAGE_KEY,
      JSON.stringify({
        currentStep: 1,
        wantsToParticipate: false,
        selectedTechnicalAreaIds: [],
        selectedOrientationTypeIds: [],
      }),
    );

    act(() => {
      result.current.setState(updatedDraft);
    });

    await waitFor(() => {
      expect(setItem).toHaveBeenCalledWith(
        MENTORSHIP_WIZARD_DRAFT_STORAGE_KEY,
        JSON.stringify(updatedDraft),
      );
    });
  });

  it("guarda los cambios del wizard como draft", async () => {
    const { result } = renderHook(() => useMentorshipWizard());

    act(() => {
      result.current.setState({
        currentStep: 2,
        wantsToParticipate: true,
        selectedTechnicalAreaIds: ["technical-area-1"],
        selectedOrientationTypeIds: [],
      });
    });

    await waitFor(() => {
      expect(
        localStorage.getItem(MENTORSHIP_WIZARD_DRAFT_STORAGE_KEY),
      ).toBe(
        JSON.stringify({
          currentStep: 2,
          wantsToParticipate: true,
          selectedTechnicalAreaIds: ["technical-area-1"],
          selectedOrientationTypeIds: [],
        }),
      );
    });
  });
});
