import { QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryClient } from "@/shared/services/query-client";
import { useMentorshipCatalogs } from "./use-mentorship-catalogs";

const serviceMocks = vi.hoisted(() => ({
  getTechnicalAreas: vi.fn(),
  getOrientationTypes: vi.fn(),
}));

vi.mock("../services/technical-area.service", () => ({
  getTechnicalAreas: serviceMocks.getTechnicalAreas,
}));

vi.mock("../services/orientation-type.service", () => ({
  getOrientationTypes: serviceMocks.getOrientationTypes,
}));

beforeEach(() => {
  vi.clearAllMocks();
  serviceMocks.getTechnicalAreas.mockResolvedValue([]);
  serviceMocks.getOrientationTypes.mockResolvedValue([]);
});

function renderCatalogsHook() {
  const queryClient = createQueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  return renderHook(() => useMentorshipCatalogs(), { wrapper });
}

describe("useMentorshipCatalogs", () => {
  it("passes only the query signal to the catalog services", async () => {
    serviceMocks.getTechnicalAreas.mockReturnValue(new Promise(() => {}));
    const { unmount } = renderCatalogsHook();
    await waitFor(() => {
      expect(serviceMocks.getTechnicalAreas).toHaveBeenCalledWith(expect.any(AbortSignal));
      expect(serviceMocks.getOrientationTypes).toHaveBeenCalledWith(expect.any(AbortSignal));
    });
    const signal = serviceMocks.getTechnicalAreas.mock.calls[0][0];
    unmount();
    expect(signal.aborted).toBe(true);
  });

  it("keeps technical areas successful when orientation types fail", async () => {
    serviceMocks.getTechnicalAreas.mockResolvedValue([
      {
        id: "550e8400-e29b-41d4-a716-446655440001",
        name: "Backend",
        description: "Desarrollo backend",
      },
    ]);
    serviceMocks.getOrientationTypes.mockRejectedValue(
      new Error("orientation types unavailable"),
    );
    const { result } = renderCatalogsHook();

    await waitFor(() => {
      expect(result.current.isOrientationTypesError).toBe(true);
    });

    expect(result.current.isTechnicalAreasError).toBe(false);
    expect(result.current.technicalAreas).toHaveLength(1);
  });

  it("refetches only technical areas when their retry is requested", async () => {
    const { result } = renderCatalogsHook();

    await waitFor(() => {
      expect(serviceMocks.getTechnicalAreas).toHaveBeenCalledTimes(1);
      expect(serviceMocks.getOrientationTypes).toHaveBeenCalledTimes(1);
    });

    act(() => {
      result.current.retryTechnicalAreas();
    });

    await waitFor(() => {
      expect(serviceMocks.getTechnicalAreas).toHaveBeenCalledTimes(2);
    });

    expect(serviceMocks.getOrientationTypes).toHaveBeenCalledTimes(1);
  });

  it("refetches only orientation types when their retry is requested", async () => {
    const { result } = renderCatalogsHook();

    await waitFor(() => {
      expect(serviceMocks.getTechnicalAreas).toHaveBeenCalledTimes(1);
      expect(serviceMocks.getOrientationTypes).toHaveBeenCalledTimes(1);
    });

    act(() => {
      result.current.retryOrientationTypes();
    });

    await waitFor(() => {
      expect(serviceMocks.getOrientationTypes).toHaveBeenCalledTimes(2);
    });

    expect(serviceMocks.getTechnicalAreas).toHaveBeenCalledTimes(1);
  });
});
