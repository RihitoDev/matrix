import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useLeaveGuard } from "./use-leave-guard";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

function addLink(href: string, attributes: Record<string, string> = {}) {
  const link = document.createElement("a");
  link.href = href;
  link.textContent = "Ir";
  Object.entries(attributes).forEach(([name, value]) => link.setAttribute(name, value));
  document.body.appendChild(link);
  return link;
}

function clickLink(link: HTMLElement, init: MouseEventInit = {}) {
  const event = new MouseEvent("click", { bubbles: true, cancelable: true, button: 0, ...init });
  act(() => {
    link.dispatchEvent(event);
  });
  return event;
}

describe("useLeaveGuard", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/vacancies/register");
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
    vi.clearAllMocks();
  });

  it("no hace nada mientras no haya cambios sin guardar", () => {
    const { result } = renderHook(() => useLeaveGuard(false));
    const event = clickLink(addLink("/profile"));
    const unload = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(unload);

    expect(event.defaultPrevented).toBe(false);
    expect(unload.defaultPrevented).toBe(false);
    expect(result.current.isLeaveDialogOpen).toBe(false);
  });

  it("advierte antes de recargar o cerrar la pestaña", () => {
    renderHook(() => useLeaveGuard(true));
    const unload = new Event("beforeunload", { cancelable: true });

    window.dispatchEvent(unload);

    expect(unload.defaultPrevented).toBe(true);
  });

  it("detiene la navegación interna y pide confirmación", () => {
    const { result } = renderHook(() => useLeaveGuard(true));

    const event = clickLink(addLink("/profile?tab=1"));

    expect(event.defaultPrevented).toBe(true);
    expect(result.current.isLeaveDialogOpen).toBe(true);
    expect(push).not.toHaveBeenCalled();
  });

  it("navega al destino al confirmar", () => {
    const { result } = renderHook(() => useLeaveGuard(true));
    clickLink(addLink("/profile?tab=1"));

    act(() => result.current.confirmLeave());

    expect(push).toHaveBeenCalledWith("/profile?tab=1");
    expect(result.current.isLeaveDialogOpen).toBe(false);
  });

  it("se queda en la página al cancelar", () => {
    const { result } = renderHook(() => useLeaveGuard(true));
    clickLink(addLink("/profile"));

    act(() => result.current.cancelLeave());

    expect(push).not.toHaveBeenCalled();
    expect(result.current.isLeaveDialogOpen).toBe(false);
  });

  it("no intercepta enlaces externos, nuevas pestañas, descargas ni la misma página", () => {
    const { result } = renderHook(() => useLeaveGuard(true));

    const events = [
      clickLink(addLink("https://maps.google.com/?q=x")),
      clickLink(addLink("/profile", { target: "_blank" })),
      clickLink(addLink("/file.pdf", { download: "" })),
      clickLink(addLink("/vacancies/register")),
      clickLink(addLink("/profile"), { ctrlKey: true }),
    ];

    expect(events.every((event) => !event.defaultPrevented)).toBe(true);
    expect(result.current.isLeaveDialogOpen).toBe(false);
  });

  it("ignora clics que no vienen de un enlace", () => {
    const { result } = renderHook(() => useLeaveGuard(true));
    const button = document.createElement("button");
    document.body.appendChild(button);

    clickLink(button);

    expect(result.current.isLeaveDialogOpen).toBe(false);
  });
});
