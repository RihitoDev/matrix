import { cleanup, render } from "@testing-library/react";
import { toast } from "sonner";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  CONNECTION_ERROR_MESSAGE,
  REGISTERED_USERS_CONNECTION_TOAST_ID,
  REGISTERED_USERS_SLOW_TOAST_ID,
  REPORT_ALERT_DURATION_MS,
  SLOW_REQUEST_MESSAGE,
} from "../constants/reports.constants";
import { useExportRegisteredUsersCsv } from "../hooks/use-export-registered-users-csv";
import { useRegisteredUsers } from "../hooks/use-registered-users";
import { RegisteredUsersReportView } from "./registered-users-report-view";

vi.mock("sonner", () => ({ toast: { warning: vi.fn(), error: vi.fn(), dismiss: vi.fn() } }));
vi.mock("../hooks/use-registered-users", () => ({ useRegisteredUsers: vi.fn() }));
vi.mock("../hooks/use-export-registered-users-csv", () => ({ useExportRegisteredUsersCsv: vi.fn() }));

function mockRegisteredUsers(state: { isSlow?: boolean; hasConnectionError?: boolean }) {
  vi.mocked(useRegisteredUsers).mockReturnValue({
    users: [],
    totalItems: 0,
    totalPages: 1,
    isLoading: false,
    errorMessage: undefined,
    isSlow: false,
    hasConnectionError: false,
    refresh: vi.fn(),
    ...state,
  });
}

describe("RegisteredUsersReportView: avisos con Sonner", () => {
  beforeEach(() => {
    vi.mocked(useExportRegisteredUsersCsv).mockReturnValue({
      exportCsv: vi.fn(),
      isExporting: false,
      errorMessage: undefined,
      successMessage: undefined,
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("avisa mientras la solicitud tarda demasiado", () => {
    mockRegisteredUsers({ isSlow: true });

    render(<RegisteredUsersReportView />);

    expect(toast.warning).toHaveBeenCalledWith(
      SLOW_REQUEST_MESSAGE,
      expect.objectContaining({ id: REGISTERED_USERS_SLOW_TOAST_ID, closeButton: true, richColors: true }),
    );
  });

  it("avisa cuando no hay conexión con el servidor", () => {
    mockRegisteredUsers({ hasConnectionError: true });

    render(<RegisteredUsersReportView />);

    expect(toast.error).toHaveBeenCalledWith(
      CONNECTION_ERROR_MESSAGE,
      expect.objectContaining({ id: REGISTERED_USERS_CONNECTION_TOAST_ID, duration: REPORT_ALERT_DURATION_MS }),
    );
  });

  it("cierra los avisos cuando la solicitud termina bien", () => {
    mockRegisteredUsers({ isSlow: true, hasConnectionError: true });
    const { rerender } = render(<RegisteredUsersReportView />);

    mockRegisteredUsers({});
    rerender(<RegisteredUsersReportView />);

    expect(toast.dismiss).toHaveBeenCalledWith(REGISTERED_USERS_SLOW_TOAST_ID);
    expect(toast.dismiss).toHaveBeenCalledWith(REGISTERED_USERS_CONNECTION_TOAST_ID);
  });

  it("no muestra avisos si la carga va bien", () => {
    mockRegisteredUsers({});

    render(<RegisteredUsersReportView />);

    expect(toast.warning).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });
});
