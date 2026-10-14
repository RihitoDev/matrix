import type { ReactNode } from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import AreaDetailInteractionPreviewPage from "./page";
import AppLayout from "../../layout";

vi.mock("@/shared/components/layout/app-shell", () => ({
  AppShell: ({ children }: { children: ReactNode }) => <div data-testid="app-shell">{children}</div>,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/area-detail-interaction-preview",
  useRouter: () => ({ replace: vi.fn() }),
}));

describe("AreaDetailInteractionPreviewPage", () => {
  beforeEach(() => sessionStorage.setItem("accessToken", `h.${btoa(JSON.stringify({ roleTag: "empresa" }))}.s`));
  afterEach(() => {
    cleanup();
    sessionStorage.clear();
  });

  it("renderiza la vista de prueba de interacción", () => {
    render(<AppLayout><AreaDetailInteractionPreviewPage /></AppLayout>);

    expect(screen.getByTestId("app-shell")).toContainElement(screen.getByRole("main"));

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Prueba de interacción del detalle por área",
      }),
    ).toBeInTheDocument();
  });

  it("muestra Desarrollo inicialmente", () => {
    render(<AppLayout><AreaDetailInteractionPreviewPage /></AppLayout>);

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Desarrollo",
      }),
    ).toBeInTheDocument();
  });

  it("permite seleccionar otra área", () => {
    render(<AppLayout><AreaDetailInteractionPreviewPage /></AppLayout>);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Data/AI",
      }),
    );

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Data/AI",
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", {
        level: 2,
        name: "Desarrollo",
      }),
    ).not.toBeInTheDocument();
  });

  it("permite cerrar el detalle seleccionado", () => {
    render(<AppLayout><AreaDetailInteractionPreviewPage /></AppLayout>);

    fireEvent.click(
      screen.getByRole("button", {
        name: /Cerrar detalle del área/i,
      }),
    );

    expect(
      screen.getByText(
        "Selecciona un área para ver su detalle.",
      ),
    ).toBeInTheDocument();
  });
});