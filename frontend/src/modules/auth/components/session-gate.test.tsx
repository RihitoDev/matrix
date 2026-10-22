import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/shared/services/api-client";
import { hasSessionMarker, setSessionMarker } from "../utils/session-cookie";
import { SessionGate } from "./session-gate";

const { route } = vi.hoisted(() => ({ route: { pathname: "/profile" } }));
const replace = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => route.pathname,
  useRouter: () => ({ replace }),
}));

function renderGate() {
  return render(
    <SessionGate>
      <p>contenido privado</p>
    </SessionGate>,
  );
}

describe("SessionGate", () => {
  beforeEach(() => window.history.replaceState({}, "", "/profile?tab=cv"));
  afterEach(() => {
    cleanup();
    sessionStorage.clear();
    document.cookie = "umssy_session=; Max-Age=0; Path=/";
    replace.mockReset();
    route.pathname = "/profile";
    window.history.replaceState({}, "", "/");
  });

  it("con token muestra el contenido, no redirige y mantiene la cookie", () => {
    sessionStorage.setItem("accessToken", "token-de-prueba");
    renderGate();

    expect(screen.getByText("contenido privado")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
    expect(hasSessionMarker()).toBe(true);
  });

  it("sin token (pestaña nueva con la cookie vieja) borra la cookie, lleva al login con next y no muestra el contenido", async () => {
    setSessionMarker();
    renderGate();

    expect(screen.queryByText("contenido privado")).toBeNull();
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login?next=%2Fprofile%3Ftab%3Dcv"));
    expect(hasSessionMarker()).toBe(false);
    expect(replace).toHaveBeenCalledTimes(1);
  });

  it("en Mis pases sin sesión lleva al login con la ruta pedida", async () => {
    route.pathname = "/events/my-passes";
    window.history.replaceState({}, "", "/events/my-passes");
    renderGate();

    expect(screen.queryByText("contenido privado")).toBeNull();
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login?next=%2Fevents%2Fmy-passes"));
  });

  it("un 401 del backend cierra la sesión y lleva al login", async () => {
    sessionStorage.setItem("accessToken", "token-de-prueba");
    renderGate();

    await expect(
      apiClient.get("/algo", {
        adapter: (config) => Promise.reject(Object.assign(new Error("no autorizado"), { isAxiosError: true, config, response: { status: 401 } })),
      }),
    ).rejects.toThrow("no autorizado");

    expect(sessionStorage.getItem("accessToken")).toBeNull();
    expect(hasSessionMarker()).toBe(false);
    expect(replace).toHaveBeenCalledWith("/login?next=%2Fprofile%3Ftab%3Dcv");
  });

  it("otros errores no cierran la sesión", async () => {
    sessionStorage.setItem("accessToken", "token-de-prueba");
    renderGate();

    await expect(
      apiClient.get("/algo", {
        adapter: (config) => Promise.reject(Object.assign(new Error("fallo"), { isAxiosError: true, config, response: { status: 500 } })),
      }),
    ).rejects.toThrow("fallo");

    expect(sessionStorage.getItem("accessToken")).toBe("token-de-prueba");
    expect(replace).not.toHaveBeenCalled();
  });

  it("el interceptor central sigue invalidando la sesión después de desmontar el guard", async () => {
    sessionStorage.setItem("accessToken", "token-de-prueba");
    const { unmount } = renderGate();
    unmount();

    await expect(
      apiClient.get("/algo", {
        adapter: (config) => Promise.reject(Object.assign(new Error("no autorizado"), { isAxiosError: true, config, response: { status: 401 } })),
      }),
    ).rejects.toThrow();

    expect(sessionStorage.getItem("accessToken")).toBeNull();
  });
});
