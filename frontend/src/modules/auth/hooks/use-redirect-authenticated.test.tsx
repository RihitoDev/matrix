import { cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAuth } from "@/shared/contexts/auth-context";
import type { AuthContextValue } from "@/shared/types/auth-context-value.types";
import { useRedirectAuthenticated } from "./use-redirect-authenticated";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

vi.mock("@/shared/contexts/auth-context", () => ({
  useAuth: vi.fn(),
}));

const authState = (roles: string[], isLoading = false) =>
  ({ roles, isLoading, refreshRoles: async () => {} }) as AuthContextValue;

describe("useRedirectAuthenticated", () => {
  beforeEach(() => {
    replace.mockReset();
    window.history.replaceState({}, "", "/login");
  });
  afterEach(() => cleanup());

  it("does nothing while the session is being validated, even with roles from the token", () => {
    vi.mocked(useAuth).mockReturnValue(authState(["administrativo"], true));
    renderHook(() => useRedirectAuthenticated());
    expect(replace).not.toHaveBeenCalled();
  });

  it("does nothing without roles", () => {
    vi.mocked(useAuth).mockReturnValue(authState([]));
    renderHook(() => useRedirectAuthenticated());
    expect(replace).not.toHaveBeenCalled();
  });

  it("does nothing when disabled", () => {
    vi.mocked(useAuth).mockReturnValue(authState(["titulado"]));
    renderHook(() => useRedirectAuthenticated(false));
    expect(replace).not.toHaveBeenCalled();
  });

  it.each([
    [["administrativo"], "/backoffice/solicitudes"],
    [["empresa"], "/recruiters"],
    [["titulado"], "/profile"],
  ])("sends %j to %s", (roles, path) => {
    vi.mocked(useAuth).mockReturnValue(authState(roles));
    renderHook(() => useRedirectAuthenticated());
    expect(replace).toHaveBeenCalledWith(path);
  });

  it("honours a safe next path the role can open", () => {
    window.history.replaceState({}, "", "/login?next=/backoffice/solicitudes");
    vi.mocked(useAuth).mockReturnValue(authState(["administrativo"]));
    renderHook(() => useRedirectAuthenticated());
    expect(replace).toHaveBeenCalledWith("/backoffice/solicitudes");
  });

  it("ignores a next path the role cannot open", () => {
    window.history.replaceState({}, "", "/login?next=/backoffice/solicitudes");
    vi.mocked(useAuth).mockReturnValue(authState(["titulado"]));
    renderHook(() => useRedirectAuthenticated());
    expect(replace).toHaveBeenCalledWith("/profile");
  });

  it("redirects once even if the component renders again with a new array of the same roles", () => {
    vi.mocked(useAuth).mockImplementation(() => authState(["titulado"]));
    const { rerender } = renderHook(() => useRedirectAuthenticated());
    rerender();
    rerender();
    expect(replace).toHaveBeenCalledTimes(1);
  });

  it("redirects only when the validation finishes", () => {
    vi.mocked(useAuth).mockReturnValue(authState(["titulado"], true));
    const { rerender } = renderHook(() => useRedirectAuthenticated());
    expect(replace).not.toHaveBeenCalled();

    vi.mocked(useAuth).mockReturnValue(authState(["titulado"], false));
    rerender();

    expect(replace).toHaveBeenCalledTimes(1);
    expect(replace).toHaveBeenCalledWith("/profile");
  });

  it("does not redirect when the session is closed after a rejected validation", () => {
    vi.mocked(useAuth).mockReturnValue(authState(["titulado"], true));
    const { rerender } = renderHook(() => useRedirectAuthenticated());

    vi.mocked(useAuth).mockReturnValue(authState([], false));
    rerender();

    expect(replace).not.toHaveBeenCalled();
  });
});
