import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RecruitersAppShell } from "./recruiters-app-shell";

vi.mock("@/shared/components/layout", () => ({
  AppShell: ({ children, items }: { children: ReactNode; items?: { label: string }[] }) => (
    <div data-testid="app-shell" data-navigation={items?.map((item) => item.label).join(",")}>{children}</div>
  ),
}));

describe("RecruitersAppShell", () => {
  afterEach(() => cleanup());

  it("muestra el contenido con la navegación del portal de empresas", () => {
    render(<RecruitersAppShell><p>contenido</p></RecruitersAppShell>);

    expect(screen.getByTestId("app-shell")).toContainElement(screen.getByText("contenido"));
    expect(screen.getByTestId("app-shell")).toHaveAttribute(
      "data-navigation",
      "Inicio,Mis vacantes,Registrar nueva vacante,Perfil de empresa",
    );
  });
});
