import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppRouteLayout as AppLayout } from "./app-route-layout";
import { ReviewQueueView } from "@/modules/radar-chart";

const { route } = vi.hoisted(() => ({ route: { pathname: "/profile" } }));

const replace = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => route.pathname,
  useRouter: () => ({ replace }),
}));

vi.mock("./app-shell", () => ({
  AppShell: ({ children, items, fullBleed }: { children: ReactNode; items?: { label: string }[]; fullBleed?: boolean }) => (
    <div data-testid="app-shell" data-navigation={items?.map((item) => item.label).join(",") ?? "general"} data-full-bleed={String(!!fullBleed)}>{children}</div>
  ),
}));

describe("AppRouteLayout", () => {
  beforeEach(() => sessionStorage.setItem("accessToken", `h.${btoa(JSON.stringify({ roleTag: "titulado", roles: ["titulado", "mentor", "empresa", "administrativo", "estudiante"] }))}.s`));
  afterEach(() => {
    cleanup();
    sessionStorage.clear();
    window.history.replaceState({}, "", "/");
    replace.mockReset();
    route.pathname = "/profile";
  });

  it("wraps every authenticated page with the app shell", () => {
    render(
      <AppLayout>
        <p>page-content</p>
      </AppLayout>,
    );

    expect(screen.getByTestId("app-shell")).toContainElement(screen.getByText("page-content"));
    expect(screen.getByTestId("app-shell")).toHaveAttribute("data-navigation", "general");
  });

  it.each([
    ["/events", "true"],
    ["/events/my-passes", "false"],
  ])("keeps the main navigation on workshop pages %s", (pathname, fullBleed) => {
    route.pathname = pathname;
    render(<AppLayout><p>event-content</p></AppLayout>);

    expect(screen.getByTestId("app-shell")).toContainElement(screen.getByText("event-content"));
    expect(screen.getByTestId("app-shell")).toHaveAttribute("data-navigation", "general");
    expect(screen.getByTestId("app-shell")).toHaveAttribute("data-full-bleed", fullBleed);
  });

  it.each(["/recruiters", "/recruiters/job-offers/new"])("uses the shared navigation on %s", (pathname) => {
    route.pathname = pathname;
    render(<AppLayout><p>recruiters-content</p></AppLayout>);

    expect(screen.getByTestId("app-shell")).toContainElement(screen.getByText("recruiters-content"));
    expect(screen.getByTestId("app-shell")).toHaveAttribute(
      "data-navigation",
      "general",
    );
  });

  it("does not treat paths that only start with the same letters as recruiters", () => {
    route.pathname = "/recruitersx";
    render(<AppLayout><p>page-content</p></AppLayout>);

    expect(screen.getByTestId("app-shell")).toHaveAttribute("data-navigation", "general");
  });

  it("renders the review queue inside exactly one shell", () => {
    route.pathname = "/affinity-radar/review-queue";
    render(<AppLayout><ReviewQueueView /></AppLayout>);

    expect(screen.getAllByTestId("app-shell")).toHaveLength(1);
    expect(screen.getByTestId("app-shell")).toContainElement(
      screen.getByRole("heading", { name: "Cola de Revisión" }),
    );
  });

  it.each(["/chat", "/vacancies", "/vacancies/1", "/vacancies/vacancies", "/area-detail-preview", "/area-detail-interaction-preview"])("requires a session on %s", (pathname) => {
    sessionStorage.clear();
    route.pathname = pathname;
    window.history.replaceState({}, "", pathname);
    render(<AppLayout><p>private-content</p></AppLayout>);

    expect(screen.queryByText("private-content")).toBeNull();
    expect(replace).toHaveBeenCalledWith(`/login?next=${encodeURIComponent(pathname)}`);
  });

  it.each([
    [["administrativo"], false],
    [["empresa"], false],
    [["empresa", "titulado"], true],
    [["administrativo", "mentor"], true],
    [["estudiante"], false],
  ])("checks chat permissions for roles %s", (roles, isAllowed) => {
    sessionStorage.setItem("accessToken", `h.${btoa(JSON.stringify({ roleTag: roles[0], roles }))}.s`);
    route.pathname = "/chat";
    render(<AppLayout><p>chat-content</p></AppLayout>);

    if (isAllowed) expect(screen.getByText("chat-content")).toBeInTheDocument();
    else {
      expect(screen.queryByText("chat-content")).toBeNull();
      expect(screen.getByRole("alert")).toHaveTextContent("No tienes permisos");
    }
  });

  it.each([
    ["/vacancies/example-id", ["administrativo"], false],
    ["/vacancies/example-id", ["estudiante"], true],
    ["/affinity-radar/review-queue", ["administrativo"], true],
    ["/affinity-radar/review-queue", ["titulado"], false],
    ["/matching", ["empresa"], true],
    ["/matching", ["mentor"], false],
    ["/mentors/example-id/availability", ["estudiante"], true],
    ["/mentorship", ["estudiante"], false],
    ["/mentor/availability", ["titulado"], false],
    ["/mentor/availability", ["titulado", "mentor"], true],
    ["/profile", ["empresa"], true],
    ["/profile/personal-info", ["empresa"], true],
    ["/profile/radar", ["empresa"], false],
  ])("checks direct access to %s for roles %s", (pathname, roles, isAllowed) => {
    sessionStorage.setItem("accessToken", `h.${btoa(JSON.stringify({ roleTag: roles[0], roles }))}.s`);
    route.pathname = pathname;
    render(<AppLayout><p>restricted-content</p></AppLayout>);
    if (isAllowed) expect(screen.getByText("restricted-content")).toBeInTheDocument();
    else expect(screen.queryByText("restricted-content")).toBeNull();
  });

  it("does not treat a backoffice prefix as an administrative route", () => {
    route.pathname = "/backofficex";
    render(<AppLayout><p>page-content</p></AppLayout>);

    expect(screen.getByTestId("app-shell")).toBeDefined();
  });

  it("sin sesión no muestra la página privada y lleva al login con la ruta pedida", () => {
    sessionStorage.clear();
    window.history.replaceState({}, "", "/profile?tab=cv");
    render(<AppLayout><p>page-content</p></AppLayout>);

    expect(screen.queryByText("page-content")).toBeNull();
    expect(replace).toHaveBeenCalledWith("/login?next=%2Fprofile%3Ftab%3Dcv");
  });

  it("Mis pases sin sesión no se muestra y lleva al login con la ruta pedida", () => {
    sessionStorage.clear();
    route.pathname = "/events/my-passes";
    window.history.replaceState({}, "", "/events/my-passes");
    render(<AppLayout><p>event-content</p></AppLayout>);

    expect(screen.queryByText("event-content")).toBeNull();
    expect(replace).toHaveBeenCalledWith("/login?next=%2Fevents%2Fmy-passes");
  });
});
