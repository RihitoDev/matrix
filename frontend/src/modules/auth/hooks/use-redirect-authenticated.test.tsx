import { cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getAccessToken } from "@/shared/services/storage/access-token-storage";
import { useRedirectAuthenticated } from "./use-redirect-authenticated";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

vi.mock("@/shared/services/storage/access-token-storage", () => ({
  getAccessToken: vi.fn(),
}));

const tokenFor = (roles: string[]) => `h.${btoa(JSON.stringify({ roles }))}.s`;

describe("useRedirectAuthenticated", () => {
  beforeEach(() => {
    replace.mockReset();
    window.history.replaceState({}, "", "/login");
  });
  afterEach(() => cleanup());

  it("does nothing without a session", () => {
    vi.mocked(getAccessToken).mockReturnValue(null);
    renderHook(() => useRedirectAuthenticated());
    expect(replace).not.toHaveBeenCalled();
  });

  it("does nothing when the token has no known role", () => {
    vi.mocked(getAccessToken).mockReturnValue("not-a-token");
    renderHook(() => useRedirectAuthenticated());
    expect(replace).not.toHaveBeenCalled();
  });

  it.each([
    [["administrativo"], "/backoffice/solicitudes"],
    [["empresa"], "/recruiters"],
    [["titulado"], "/profile"],
  ])("sends %j to %s", (roles, path) => {
    vi.mocked(getAccessToken).mockReturnValue(tokenFor(roles));
    renderHook(() => useRedirectAuthenticated());
    expect(replace).toHaveBeenCalledWith(path);
  });

  it("honours a safe next path the role can open", () => {
    window.history.replaceState({}, "", "/login?next=/backoffice/solicitudes");
    vi.mocked(getAccessToken).mockReturnValue(tokenFor(["administrativo"]));
    renderHook(() => useRedirectAuthenticated());
    expect(replace).toHaveBeenCalledWith("/backoffice/solicitudes");
  });

  it("ignores a next path the role cannot open", () => {
    window.history.replaceState({}, "", "/login?next=/backoffice/solicitudes");
    vi.mocked(getAccessToken).mockReturnValue(tokenFor(["titulado"]));
    renderHook(() => useRedirectAuthenticated());
    expect(replace).toHaveBeenCalledWith("/profile");
  });
});
