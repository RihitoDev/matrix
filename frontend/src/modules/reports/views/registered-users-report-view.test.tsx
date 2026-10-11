import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ApiResponse, PaginatedData } from "@/shared/types/api-response.types";
import * as downloadFileModule from "@/shared/utils/download-file";
import { reportsService } from "../services/reports.service";
import type { RegisteredUser, UserType } from "../types/registered-user.types";
import { RegisteredUsersReportView } from "./registered-users-report-view";

const REGISTERED_USERS: RegisteredUser[] = [
  { id: "1", fullName: "Juan Carlos Peres Rojas", email: "jc.peraz@gmail.com", userType: "DEGREE_HOLDER", identifier: "201942394", documentType: "ACADEMIC_DEGREE", registeredAt: "2026-03-15T10:00:00" },
  { id: "2", fullName: "Maria Quispe Mamani", email: "maria.qui@gmail.com", userType: "DEGREE_HOLDER", identifier: "201902277", documentType: "NATIONAL_DEGREE", registeredAt: "2026-02-20T10:00:00" },
  { id: "3", fullName: "Luis Fernando Vargaz Saliz", email: "lf.vargas.ct@gmail.com", userType: "GRADUATE", identifier: "201701190", documentType: "GRADUATION_CERTIFICATE", registeredAt: "2025-01-10T10:00:00" },
  { id: "4", fullName: "Andrea Camacho Torrez", email: "andrea.ct@gmail.com", userType: "GRADUATE", identifier: "201905853", documentType: "ACADEMIC_DIPLOMA", registeredAt: "2025-01-10T10:00:00" },
  { id: "5", fullName: "Rodrigo Gutiérrez Arce", email: "r.rutiereer@outlook.com", userType: "DEGREE_HOLDER", identifier: "201603348", documentType: "NATIONAL_DEGREE", registeredAt: "2025-01-10T10:00:00" },
  { id: "6", fullName: "Sofia Fernandez Claras", email: "sofia.fo@gmail.com", userType: "DEGREE_HOLDER", identifier: "201909731", documentType: "ACADEMIC_DIPLOMA", registeredAt: "2025-01-10T10:00:00" },
  { id: "7", fullName: "Diego Mercado Rocha", email: "dmercado@gmail.com", userType: "COMPANY", identifier: "1029964756", documentType: "NIT", registeredAt: "2025-01-10T10:00:00" },
  { id: "8", fullName: "Valeria Amez Lima", email: "vale.amez@gmail.com", userType: "ADMIN", identifier: "201902214", documentType: "ACADEMIC_DIPLOMA", registeredAt: "2026-03-15T10:00:00" },
  { id: "9", fullName: "Stephanie Mamani Choque", email: "stephanie.mamani@gmail.com", userType: "DEGREE_HOLDER", identifier: "202004667", documentType: "NATIONAL_DEGREE", registeredAt: "2026-03-15T10:00:00" },
  { id: "10", fullName: "Carlos Rivera Quispe", email: "carlos.rivera@gmail.com", userType: "GRADUATE", identifier: "201702345", documentType: "GRADUATION_CERTIFICATE", registeredAt: "2026-03-15T10:00:00" },
  { id: "11", fullName: "Ana Lucia Rojas Vera", email: "ana.rojas@gmail.com", userType: "STUDENT", identifier: "201801122", documentType: "ENROLLMENT_CERTIFICATE", registeredAt: "2025-11-04T10:00:00" },
  { id: "12", fullName: "Marco Antonio Flores Paz", email: "marco.flores@gmail.com", userType: "DEGREE_HOLDER", identifier: "201604587", documentType: "ACADEMIC_DEGREE", registeredAt: "2025-10-22T10:00:00" },
  { id: "13", fullName: "Tecnologías Andinas SRL", email: "rrhh@tecandinas.com", userType: "COMPANY", identifier: "3012457018", documentType: "NIT", registeredAt: "2025-10-15T10:00:00" },
  { id: "14", fullName: "Gabriela Soliz Arnez", email: "gabriela.soliz@gmail.com", userType: "MENTOR", identifier: "201903318", documentType: "ACADEMIC_DEGREE", registeredAt: "2025-09-30T10:00:00" },
  { id: "15", fullName: "Jorge Luis Céspedes Ortiz", email: "jl.cespedes@outlook.com", userType: "DEGREE_HOLDER", identifier: "201505976", documentType: "NATIONAL_DEGREE", registeredAt: "2025-09-12T10:00:00" },
  { id: "16", fullName: "Paola Andrea Guzmán Ríos", email: "paola.guzman@gmail.com", userType: "DEGREE_HOLDER", identifier: "201806641", documentType: "ACADEMIC_DEGREE", registeredAt: "2025-08-28T10:00:00" },
  { id: "17", fullName: "Innova Soft SA", email: "contacto@innovasoft.bo", userType: "COMPANY", identifier: "2098754013", documentType: "NIT", registeredAt: "2025-08-14T10:00:00" },
  { id: "18", fullName: "Ricardo Montaño Vidal", email: "ricardo.montano@gmail.com", userType: "STUDENT", identifier: "202001459", documentType: "ENROLLMENT_CERTIFICATE", registeredAt: "2025-07-30T10:00:00" },
  { id: "19", fullName: "Daniela Ugarte Salas", email: "daniela.ugarte@gmail.com", userType: "ADMIN", identifier: "201707783", documentType: "ACADEMIC_DEGREE", registeredAt: "2025-07-02T10:00:00" },
  { id: "20", fullName: "Fernando Aguilar Terán", email: "f.aguilar@gmail.com", userType: "DEGREE_HOLDER", identifier: "201408812", documentType: "NATIONAL_DEGREE", registeredAt: "2025-06-18T10:00:00" },
  { id: "21", fullName: "Lucía Herrera Pinto", email: "lucia.herrera@gmail.com", userType: "MENTOR", identifier: "202102204", documentType: "ACADEMIC_DEGREE", registeredAt: "2025-05-27T10:00:00" },
  { id: "22", fullName: "Mauricio Zeballos Durán", email: "mauricio.z@outlook.com", userType: "DEGREE_HOLDER", identifier: "201609935", documentType: "ACADEMIC_DEGREE", registeredAt: "2025-05-06T10:00:00" },
  { id: "23", fullName: "Datalab Bolivia SRL", email: "info@datalab.bo", userType: "COMPANY", identifier: "4015862011", documentType: "NIT", registeredAt: "2025-04-15T10:00:00" },
  { id: "24", fullName: "Camila Vargas Orellana", email: "camila.vargas@gmail.com", userType: "GRADUATE", identifier: "202003376", documentType: "GRADUATION_CERTIFICATE", registeredAt: "2025-03-20T10:00:00" },
];

function buildResponse(page: number, limit: number, userType?: UserType): ApiResponse<PaginatedData<RegisteredUser>> {
  const filteredUsers = userType ? REGISTERED_USERS.filter((user) => user.userType === userType) : REGISTERED_USERS;
  const offset = (page - 1) * limit;

  return {
    statusCode: 200,
    data: { items: filteredUsers.slice(offset, offset + limit), totalItems: filteredUsers.length },
    page,
    detail: "Usuarios registrados obtenidos correctamente",
    ok: true,
  };
}

async function renderLoadedView() {
  render(<RegisteredUsersReportView />);
  await waitFor(() => {
    expect(screen.getByText("Juan Carlos Peres Rojas")).toBeDefined();
  });
}

async function selectUserType(user: UserEvent, label: string) {
  await user.click(screen.getByRole("combobox", { name: "Tipo de usuario" }));
  await user.click(await screen.findByRole("option", { name: label }));
}

describe("RegisteredUsersReportView", () => {
  beforeEach(() => {
    vi.spyOn(reportsService, "getRegisteredUsers").mockImplementation(async ({ page, limit, userType }) =>
      buildResponse(page, limit, userType),
    );
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("muestra el título, los botones y la primera página de usuarios", async () => {
    render(<RegisteredUsersReportView />);

    expect(screen.getByRole("heading", { name: "Reporte de usuarios registrados" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Exportar CSV" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Gestión" })).toBeDefined();
    expect(screen.getByRole("button", { name: "actualizar" })).toBeDefined();
    expect(screen.getByText("Cargando usuarios...")).toBeDefined();
    expect(screen.getAllByTestId("skeleton-row")).toHaveLength(5);

    await waitFor(() => {
      expect(screen.getByText("Juan Carlos Peres Rojas")).toBeDefined();
    });
    expect(screen.getByText("jc.peraz@gmail.com")).toBeDefined();
    expect(screen.getAllByText("Título académico").length).toBeGreaterThan(0);
    expect(screen.getAllByText("15/03/2026").length).toBeGreaterThan(0);
    expect(screen.getByText("Mostrando 1-10 de 24 usuarios")).toBeDefined();
    expect(screen.getByRole("button", { name: "Página 3" })).toBeDefined();
  });

  it("ofrece las opciones de tipo de usuario en orden", async () => {
    render(<RegisteredUsersReportView />);

    expect(screen.queryByRole("listbox")).toBeNull();
    await userEvent.setup().click(screen.getByRole("combobox", { name: "Tipo de usuario" }));

    await screen.findByRole("listbox");
    const options = screen.getAllByRole("option").map((option) => option.textContent);
    expect(options).toEqual(["Todos", "Estudiante", "Titulado", "Mentor", "Empresa", "Administrador"]);
  });

  it("vuelve a cargar los datos al presionar actualizar", async () => {
    const getRegisteredUsersSpy = vi.spyOn(reportsService, "getRegisteredUsers");
    await renderLoadedView();

    fireEvent.click(screen.getByRole("button", { name: "actualizar" }));

    expect(screen.getByRole<HTMLButtonElement>("button", { name: "actualizar" }).disabled).toBe(true);
    await waitFor(() => {
      expect(screen.getByText("Juan Carlos Peres Rojas")).toBeDefined();
    });
    expect(getRegisteredUsersSpy).toHaveBeenCalledTimes(2);
  });

  it("navega a la última página", async () => {
    await renderLoadedView();

    fireEvent.click(screen.getByRole("button", { name: "Página 3" }));

    await waitFor(() => {
      expect(screen.getByText("Camila Vargas Orellana")).toBeDefined();
    });
    expect(screen.getByText("Mostrando 21-24 de 24 usuarios")).toBeDefined();
  });

  it("filtra por tipo de usuario y vuelve a la primera página", async () => {
    const user = userEvent.setup();
    await renderLoadedView();

    fireEvent.click(screen.getByRole("button", { name: "Página 2" }));
    await waitFor(() => {
      expect(screen.getByText("Mostrando 11-20 de 24 usuarios")).toBeDefined();
    });

    await selectUserType(user, "Empresa");

    await waitFor(() => {
      expect(screen.getByText("Mostrando 1-4 de 4 usuarios")).toBeDefined();
    });
    expect(screen.getByText("Diego Mercado Rocha")).toBeDefined();
    expect(screen.queryByText("Juan Carlos Peres Rojas")).toBeNull();
    expect(screen.getByRole("combobox", { name: "Tipo de usuario" }).textContent).toContain("Empresa");

    await selectUserType(user, "Mentor");
    await waitFor(() => {
      expect(screen.getByText("Mostrando 1-2 de 2 usuarios")).toBeDefined();
    });
    expect(screen.getByText("Gabriela Soliz Arnez")).toBeDefined();

    await selectUserType(user, "Todos");
    await waitFor(() => {
      expect(screen.getByText("Mostrando 1-10 de 24 usuarios")).toBeDefined();
    });
  });

  it("maneja el filtro con el teclado y lo cierra con Escape o al hacer clic afuera", async () => {
    const user = userEvent.setup();
    await renderLoadedView();
    const combobox = screen.getByRole("combobox", { name: "Tipo de usuario" });

    combobox.focus();
    await user.keyboard("{ArrowDown}");
    expect(await screen.findByRole("listbox")).toBeDefined();
    await user.keyboard("{ArrowDown}{Enter}");

    await waitFor(() => {
      expect(screen.queryByRole("listbox")).toBeNull();
    });
    await waitFor(() => {
      expect(combobox.textContent).toContain("Estudiante");
    });

    await user.click(combobox);
    expect(await screen.findByRole("listbox")).toBeDefined();
    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("listbox")).toBeNull();
    });

    await user.click(combobox);
    expect(await screen.findByRole("listbox")).toBeDefined();
    await user.click(document.body);
    await waitFor(() => {
      expect(screen.queryByRole("listbox")).toBeNull();
    });
  });

  it("no vuelve a consultar si se elige la misma opción", async () => {
    const user = userEvent.setup();
    const getRegisteredUsersSpy = vi.spyOn(reportsService, "getRegisteredUsers");
    await renderLoadedView();

    await selectUserType(user, "Todos");

    await waitFor(() => {
      expect(screen.queryByRole("listbox")).toBeNull();
    });
    expect(getRegisteredUsersSpy).toHaveBeenCalledTimes(1);
  });

  it("muestra un mensaje cuando no hay usuarios", async () => {
    vi.spyOn(reportsService, "getRegisteredUsers").mockResolvedValueOnce({
      statusCode: 200,
      data: { items: [], totalItems: 0 },
      detail: "Sin datos",
      ok: true,
    });

    render(<RegisteredUsersReportView />);

    await waitFor(() => {
      expect(screen.getByText("No hay usuarios registrados para este filtro.")).toBeDefined();
    });
    expect(screen.getByText("Mostrando 0-0 de 0 usuarios")).toBeDefined();
  });

  it("muestra un mensaje de error si falla la carga", async () => {
    vi.spyOn(reportsService, "getRegisteredUsers").mockRejectedValueOnce(new Error("Network error"));

    render(<RegisteredUsersReportView />);

    await waitFor(() => {
      expect(screen.getByText("No se pudo cargar el reporte de usuarios registrados.")).toBeDefined();
    });
  });

  it("exporta en CSV los usuarios del filtro seleccionado y descarga el archivo", async () => {
    const user = userEvent.setup();
    const file = new Blob(["Usuario"], { type: "text/csv" });
    let resolveExport: (value: { file: Blob; fileName: string }) => void = () => undefined;
    const exportSpy = vi.spyOn(reportsService, "exportRegisteredUsersCsv").mockImplementationOnce(
      () => new Promise((resolve) => (resolveExport = resolve)),
    );
    const downloadSpy = vi.spyOn(downloadFileModule, "downloadFile").mockImplementation(() => undefined);
    await renderLoadedView();
    await selectUserType(user, "Empresa");

    await user.click(screen.getByRole("button", { name: "Exportar CSV" }));

    const exportingButton = screen.getByRole("button", { name: "Exportando..." }) as HTMLButtonElement;
    expect(exportingButton.disabled).toBe(true);
    expect(exportSpy).toHaveBeenCalledWith({ userType: "COMPANY" });

    resolveExport({ file, fileName: "usuarios-registrados-2026-10-03.csv" });
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Exportar CSV" })).toBeDefined();
    });
    expect(downloadSpy).toHaveBeenCalledWith(file, "usuarios-registrados-2026-10-03.csv");
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("muestra un mensaje si falla la exportación", async () => {
    vi.spyOn(reportsService, "exportRegisteredUsersCsv").mockRejectedValueOnce(new Error("Network error"));
    const downloadSpy = vi.spyOn(downloadFileModule, "downloadFile");
    await renderLoadedView();

    fireEvent.click(screen.getByRole("button", { name: "Exportar CSV" }));

    expect((await screen.findByRole("alert")).textContent).toBe("No se pudo exportar el reporte. Inténtalo de nuevo.");
    expect(downloadSpy).not.toHaveBeenCalled();
  });
});
