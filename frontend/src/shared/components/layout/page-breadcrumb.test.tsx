import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PageBreadcrumb } from "./page-breadcrumb";

describe("PageBreadcrumb", () => {
  afterEach(() => {
    cleanup();
  });

  it("muestra enlaces, textos sin enlace y la página actual", () => {
    render(
      <PageBreadcrumb
        items={[
          { label: "Inicio", href: "/dashboard" },
          { label: "Reportes Analíticos" },
          { label: "Reporte de usuarios rechazados" },
        ]}
      />,
    );

    const navigation = screen.getByRole("navigation", { name: "Ruta de navegación" });
    expect(navigation).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Inicio" })).toHaveAttribute("href", "/dashboard");
    expect(screen.getByText("Reportes Analíticos").tagName).toBe("SPAN");
    expect(screen.getByText("Reporte de usuarios rechazados")).toHaveAttribute("aria-current", "page");
    expect(navigation.querySelectorAll('[data-slot="breadcrumb-separator"]')).toHaveLength(2);
  });
});
