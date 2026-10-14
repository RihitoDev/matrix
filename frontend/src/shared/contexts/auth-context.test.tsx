import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import { authService } from "@/modules/auth";
import { saveAccessToken, clearAccessToken } from "@/shared/services/storage/access-token-storage";
import { AuthProvider, useAuth } from "./auth-context";

afterEach(() => {
  cleanup();
  sessionStorage.clear();
  vi.restoreAllMocks();
});

function SessionConsumer() {
  const { roles, refreshRoles } = useAuth();
  return (
    <>
      <p data-testid="roles">{roles.join(",")}</p>
      <button onClick={() => void refreshRoles()}>Actualizar roles</button>
    </>
  );
}

function renderSession() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}><AuthProvider><SessionConsumer /></AuthProvider></QueryClientProvider>);
}

describe("AuthProvider", () => {
  it("loads all current roles for an existing single-role token and refreshes them", async () => {
    saveAccessToken(`h.${btoa(JSON.stringify({ roleTag: "titulado" }))}.s`);
    const getSession = vi.spyOn(authService, "getSession").mockResolvedValue({ id: "u1", email: "user@test.com", roles: ["titulado", "mentor"] });
    renderSession();
    await waitFor(() => expect(screen.getByTestId("roles")).toHaveTextContent("titulado,mentor"));

    getSession.mockResolvedValue({ id: "u1", email: "user@test.com", roles: ["titulado"] });
    fireEvent.click(screen.getByRole("button", { name: "Actualizar roles" }));
    await waitFor(() => expect(screen.getByTestId("roles").textContent).toBe("titulado"));

    act(() => { clearAccessToken(); });
    expect(screen.getByTestId("roles").textContent).toBe("");
  });

  it("does not fetch roles without a session", () => {
    const getSession = vi.spyOn(authService, "getSession");
    renderSession();
    expect(getSession).not.toHaveBeenCalled();
    expect(screen.getByTestId("roles").textContent).toBe("");
  });

  it("clears a revoked session instead of retaining JWT permissions", async () => {
    saveAccessToken(`h.${btoa(JSON.stringify({ roles: ["administrativo"] }))}.s`);
    vi.spyOn(authService, "getSession").mockRejectedValue(Object.assign(new Error("Unauthorized"), { isAxiosError: true, response: { status: 401 } }));
    renderSession();
    await waitFor(() => expect(sessionStorage.getItem("accessToken")).toBeNull());
    expect(screen.getByTestId("roles").textContent).toBe("");
  });
});
