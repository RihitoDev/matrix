import type { ReactNode } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AreaDetailPreviewPage from "./page";

vi.mock("@/modules/radar-chart/components/epic3-shell", () => ({
  Epic3Shell: ({ children }: { children: ReactNode }) => children,
}));

function getTab(name: RegExp) {
  return screen.getByRole("tab", { name });
}

describe("AreaDetailPreviewPage", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows the page title, the breadcrumb and the candidate card", () => {
    render(<AreaDetailPreviewPage />);

    expect(screen.getByRole("heading", { level: 1, name: "Detalle por área" })).toBeDefined();
    expect(screen.getByRole("navigation", { name: "Ruta de navegación" }).textContent).toBe(
      "ReclutamientoRadar Charts",
    );
    expect(screen.getByText("Carlos Mendoza Ríos")).toBeDefined();
    expect(screen.getByText("Senior Software Engineer")).toBeDefined();
    expect(screen.getByText("CM")).toBeDefined();
    expect(screen.getByText("promedio").parentElement?.textContent).toBe("6,25promedio");
  });

  it("shows the Desarrollo detail inside the tab panel by default", () => {
    render(<AreaDetailPreviewPage />);

    const tab = getTab(/Desarrollo/);
    const tabPanel = screen.getByRole("tabpanel");

    expect(screen.getByRole("heading", { level: 2, name: "Desarrollo" })).toBeDefined();
    expect(tab.getAttribute("aria-selected")).toBe("true");
    expect(tab.getAttribute("aria-controls")).toBe(tabPanel.getAttribute("id"));
    expect(tabPanel.getAttribute("aria-labelledby")).toBe(tab.getAttribute("id"));
  });

  it("renders one numbered tab per area in the radar order with its score", () => {
    render(<AreaDetailPreviewPage />);

    const tabs = screen.getAllByRole("tab");

    expect(screen.getByRole("tablist", { name: "Áreas de afinidad" })).toBeDefined();
    expect(tabs.map((tab) => tab.textContent)).toEqual([
      "1Desarrollo8,5",
      "2Cloud/DevOps7,0",
      "3Data/AI6,5",
      "4QA5,0",
      "5Ciberseguridad4,5",
      "6Gobernanza TI6,0",
    ]);
  });

  it("changes the detail when another area is selected", () => {
    render(<AreaDetailPreviewPage />);

    fireEvent.click(getTab(/QA/));

    expect(screen.getByRole("heading", { level: 2, name: "QA" })).toBeDefined();
    expect(screen.queryByRole("heading", { level: 2, name: "Desarrollo" })).toBeNull();
    expect(getTab(/QA/).getAttribute("aria-selected")).toBe("true");
    expect(getTab(/Desarrollo/).getAttribute("aria-selected")).toBe("false");
  });

  it("keeps only the selected tab in the tab order", () => {
    render(<AreaDetailPreviewPage />);

    fireEvent.click(getTab(/QA/));

    expect(screen.getAllByRole("tab").map((tab) => tab.getAttribute("tabindex"))).toEqual([
      "-1",
      "-1",
      "-1",
      "0",
      "-1",
      "-1",
    ]);
  });

  it("moves between areas with the left and right arrow keys", () => {
    render(<AreaDetailPreviewPage />);

    fireEvent.keyDown(getTab(/Desarrollo/), { key: "ArrowRight" });

    expect(getTab(/Cloud\/DevOps/).getAttribute("aria-selected")).toBe("true");
    expect(document.activeElement).toBe(getTab(/Cloud\/DevOps/));
    expect(screen.getByRole("heading", { level: 2, name: "Cloud/DevOps" })).toBeDefined();

    fireEvent.keyDown(getTab(/Cloud\/DevOps/), { key: "ArrowLeft" });

    expect(getTab(/Desarrollo/).getAttribute("aria-selected")).toBe("true");
    expect(document.activeElement).toBe(getTab(/Desarrollo/));
  });

  it("wraps around at both ends and supports Home and End", () => {
    render(<AreaDetailPreviewPage />);

    fireEvent.keyDown(getTab(/Desarrollo/), { key: "ArrowLeft" });
    expect(getTab(/Gobernanza TI/).getAttribute("aria-selected")).toBe("true");

    fireEvent.keyDown(getTab(/Gobernanza TI/), { key: "ArrowRight" });
    expect(getTab(/Desarrollo/).getAttribute("aria-selected")).toBe("true");

    fireEvent.keyDown(getTab(/Desarrollo/), { key: "End" });
    expect(getTab(/Gobernanza TI/).getAttribute("aria-selected")).toBe("true");

    fireEvent.keyDown(getTab(/Gobernanza TI/), { key: "Home" });
    expect(getTab(/Desarrollo/).getAttribute("aria-selected")).toBe("true");
  });

  it("ignores other keys", () => {
    render(<AreaDetailPreviewPage />);

    fireEvent.keyDown(getTab(/Desarrollo/), { key: "a" });

    expect(getTab(/Desarrollo/).getAttribute("aria-selected")).toBe("true");
  });

  it("hides the panel and shows the hint when the detail is closed", () => {
    render(<AreaDetailPreviewPage />);

    fireEvent.click(screen.getByRole("button", { name: "Cerrar detalle del área" }));

    expect(screen.queryByRole("heading", { level: 2 })).toBeNull();
    expect(screen.queryByRole("tabpanel")).toBeNull();
    expect(screen.getByText("Selecciona un área para ver su detalle")).toBeDefined();
    expect(screen.getAllByRole("tab").map((tab) => tab.getAttribute("aria-selected"))).toEqual(
      Array(6).fill("false"),
    );
    expect(getTab(/Desarrollo/).getAttribute("tabindex")).toBe("0");
  });

  it("opens the panel again when a tab is selected after closing", () => {
    render(<AreaDetailPreviewPage />);

    fireEvent.click(screen.getByRole("button", { name: "Cerrar detalle del área" }));
    fireEvent.click(getTab(/Data\/AI/));

    expect(screen.getByRole("heading", { level: 2, name: "Data/AI" })).toBeDefined();
  });

  it("shows a focus ring on the tabs only for keyboard focus", () => {
    render(<AreaDetailPreviewPage />);

    screen.getAllByRole("tab").forEach((tab) => {
      const classes = tab.className.split(" ");

      expect(classes).toContain("outline-none");
      expect(classes).toContain("rounded-md");
      expect(classes).toContain("focus-visible:ring-2");
      expect(classes).toContain("focus-visible:ring-offset-2");
      expect(classes.some((name) => /^(focus:|ring-\d)/.test(name))).toBe(false);
    });
  });
});
