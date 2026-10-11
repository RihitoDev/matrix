import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BackofficeBrand } from "./backoffice-brand";
import { DetailHeader, InboxHeader } from "./backoffice-page-header";
import { BackofficeUserFooter } from "./backoffice-user-footer";

describe("marca, cabeceras y pie del backoffice", () => {
  afterEach(() => cleanup());

  it("la marca es el texto UMSSY con el subtítulo, sin escudo ni lema", () => {
    const { container } = render(<BackofficeBrand />);

    expect(screen.getByText("UMSSY")).toBeInTheDocument();
    expect(screen.getByText("Backoffice de verificación")).toBeInTheDocument();
    expect(container.querySelector("svg")).toBeNull();
    expect(document.body.textContent).not.toContain("Universidad para el futuro");
  });

  it("la cabecera de la bandeja muestra el subtítulo sobre el título en negrita", () => {
    render(<InboxHeader />);
    expect(screen.getByText("Revisa el documento de cada solicitante y emite tu dictamen.")).toHaveClass("text-text-secondary");
    expect(screen.getByRole("heading", { name: "Solicitudes de acceso" })).toHaveClass("font-bold");
  });

  it("las migas del detalle llevan flecha de volver, el enlace y el código en negrita", () => {
    render(<DetailHeader requestCode="SOL-2026-0148" />);

    expect(screen.getByRole("link", { name: "Volver a la bandeja" })).toHaveAttribute("href", "/backoffice/solicitudes");
    expect(screen.getByRole("link", { name: "Solicitudes de acceso" })).toHaveAttribute("href", "/backoffice/solicitudes");
    expect(screen.getByText("SOL-2026-0148")).toHaveClass("font-semibold");
  });

  it("sin código las migas no muestran el separador", () => {
    const { container } = render(<DetailHeader />);
    expect(container.querySelectorAll("svg")).toHaveLength(1);
  });

  it("el pie muestra avatar de iniciales, nombre, cargo y el icono para cerrar sesión", () => {
    const onLogout = vi.fn();
    render(<BackofficeUserFooter user={{ fullName: "Carla Montaño", role: "Secretaría de Carrera" }} onLogout={onLogout} />);

    expect(screen.getByText("CM")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("Carla Montaño")).toBeInTheDocument();
    expect(screen.getByText("Secretaría de Carrera")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Cerrar sesión" }));
    expect(onLogout).toHaveBeenCalledOnce();
  });

  it("el pie deja envolver el nombre y el cargo (sin truncar)", () => {
    render(<BackofficeUserFooter user={{ fullName: "Personal administrativo", role: "Administrativo" }} onLogout={vi.fn()} />);
    expect(screen.getByText("Personal administrativo")).not.toHaveClass("truncate");
    expect(screen.getByText("Personal administrativo")).toHaveClass("break-words");
    expect(screen.getByText("Administrativo")).not.toHaveClass("truncate");
  });
});
