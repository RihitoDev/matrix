import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryWrapper } from "@/shared/testing/create-query-wrapper";
import { REQUEST_REVIEW_QUERY_KEYS } from "../constants/request-review-query-keys.constants";
import { requestReviewService } from "../services/request-review.service";
import { detail } from "../components/detail/data-contrast-panel.test";
import { useRequestDetail } from "./use-request-detail";
import { useStatusCounts } from "./use-status-counts";

const listRequests = vi.spyOn(requestReviewService, "listRequests");
const getRequestDetail = vi.spyOn(requestReviewService, "getRequestDetail");

const totalOf = (total: number) => ({ ok: true as const, data: { items: [], total, page: 1, offset: 0 } });

describe("useStatusCounts", () => {
  beforeEach(() => {
    listRequests.mockReset();
    getRequestDetail.mockReset();
  });
  afterEach(() => cleanup());

  it("cuenta cada estado con el total del listado y omite el que falla", async () => {
    listRequests.mockImplementation(async (status) =>
      status === "approved" ? { ok: false, status: 500, message: "boom" } : totalOf(status === "pending" ? 2 : 7),
    );
    const { wrapper } = createQueryWrapper();

    const { result } = renderHook(() => useStatusCounts(["pending", "rejected", "approved"]), { wrapper });

    await waitFor(() => expect(result.current).toEqual({ pending: 2, rejected: 7 }));
    expect(listRequests).toHaveBeenCalledWith("pending", 1, 1);
  });

  it("el conteo del menú y el de la pestaña comparten la misma consulta", async () => {
    listRequests.mockResolvedValue(totalOf(1));
    const { wrapper } = createQueryWrapper();

    const menu = renderHook(() => useStatusCounts(["pending"]), { wrapper });
    const tabs = renderHook(() => useStatusCounts(["pending", "in_review"]), { wrapper });

    await waitFor(() => expect(menu.result.current.pending).toBe(1));
    await waitFor(() => expect(tabs.result.current.pending).toBe(1));
    expect(listRequests.mock.calls.filter(([status]) => status === "pending")).toHaveLength(1);
  });

  it("al invalidar la bandeja el conteo se actualiza sin recargar", async () => {
    listRequests.mockResolvedValueOnce(totalOf(2)).mockResolvedValue(totalOf(1));
    const { wrapper, client } = createQueryWrapper();
    const { result } = renderHook(() => useStatusCounts(["pending"]), { wrapper });
    await waitFor(() => expect(result.current.pending).toBe(2));

    await act(() => client.invalidateQueries({ queryKey: REQUEST_REVIEW_QUERY_KEYS.inbox }));

    await waitFor(() => expect(result.current.pending).toBe(1));
  });

  it("abrir una solicitud que queda en revisión refresca los conteos de la bandeja", async () => {
    listRequests.mockResolvedValueOnce(totalOf(2)).mockResolvedValue(totalOf(1));
    getRequestDetail.mockResolvedValue({ ok: true, data: detail });
    const { wrapper } = createQueryWrapper();
    const counts = renderHook(() => useStatusCounts(["pending"]), { wrapper });
    await waitFor(() => expect(counts.result.current.pending).toBe(2));

    renderHook(() => useRequestDetail("id-1"), { wrapper });

    await waitFor(() => expect(counts.result.current.pending).toBe(1));
  });
});
