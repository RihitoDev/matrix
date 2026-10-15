import { cleanup, screen } from "@testing-library/react";
import { renderWithQuery } from "@/shared/testing/render-with-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { stubMatchMedia } from "@/shared/testing/stub-match-media";
import { BackofficeShell } from "./backoffice-shell";

const session = vi.hoisted(() => ({ state: "checking" as "checking" | "login" | "forbidden" | "allowed" }));

vi.mock("next/navigation", () => ({ usePathname: () => "/backoffice/solicitudes", useRouter: () => ({ replace: vi.fn() }) }));
vi.mock("../../hooks/use-backoffice-session", () => ({
  useBackofficeSession: () => ({ state: session.state, logout: vi.fn() }),
}));
vi.mock("../../hooks/use-backoffice-user", async () => {
  const { useAuth } = await import("@/shared/contexts/auth-context");
  const { getRolesLabel } = await import("@/modules/auth");
  return {
    useBackofficeUser: () => ({ fullName: "Personal administrativo", role: getRolesLabel(useAuth().roles) }),
  };
});
vi.mock("../../services/request-review.service", () => ({
  requestReviewService: { listRequests: vi.fn().mockResolvedValue({ ok: false, status: 0, message: "x" }) },
}));

const FORBIDDEN_TEXTS = ["Universidad para el futuro", "Mentorías", "Inicio"];

describe("BackofficeShell: nunca pinta el shell por defecto", () => {
  beforeEach(() => stubMatchMedia());
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it.each(["checking", "login", "forbidden"] as const)(
    "con la sesión en estado %s muestra el shell del backoffice con un esqueleto y sin contenido",
    (state) => {
      session.state = state;
      renderWithQuery(
        <BackofficeShell>
          <p>Contenido protegido</p>
        </BackofficeShell>,
      );

      expect(screen.getByText("UMSSY")).toBeInTheDocument();
      expect(screen.getByText("Backoffice de verificación")).toBeInTheDocument();
      expect(screen.getByTestId("backoffice-session-skeleton")).toBeInTheDocument();
      expect(screen.queryByText("Contenido protegido")).toBeNull();
      for (const text of FORBIDDEN_TEXTS) expect(screen.queryByText(text)).toBeNull();
      expect(document.querySelectorAll("[data-slot='sidebar']").length).toBeLessThanOrEqual(1);
    },
  );

  it("con sesión de administrativo muestra el contenido y tampoco el shell por defecto", () => {
    session.state = "allowed";
    renderWithQuery(
      <BackofficeShell>
        <p>Contenido protegido</p>
      </BackofficeShell>,
    );

    expect(screen.getByText("Contenido protegido")).toBeInTheDocument();
    expect(screen.queryByTestId("backoffice-session-skeleton")).toBeNull();
    for (const text of FORBIDDEN_TEXTS) expect(screen.queryByText(text)).toBeNull();
  });
});
