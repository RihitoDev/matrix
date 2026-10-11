import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import RequestAccessPage, { metadata } from "./page";

// El encabezado usa useRouter, que necesita el App Router montado
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

describe("RequestAccessPage", () => {
  afterEach(() => cleanup());

  it("renderiza la vista de solicitud de acceso", () => {
    render(<RequestAccessPage />);

    expect(screen.getByRole("heading", { name: "Solicita tu acceso a la comunidad" })).toBeInTheDocument();
  });

  it("define el título de la página", () => {
    expect(metadata.title).toBe("Solicitud de acceso");
  });
});
