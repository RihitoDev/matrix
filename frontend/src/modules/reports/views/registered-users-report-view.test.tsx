import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ApiResponse, PaginatedData } from "@/shared/types/api-response.types";
import * as downloadFileModule from "@/shared/utils/download-file";
import { reportsService } from "../services/reports.service";
import type { RegisteredUser, RegisteredUsersParams } from "../types/registered-user.types";
import { RegisteredUsersReportView } from "./registered-users-report-view";

const REGISTERED_USERS: RegisteredUser[] = [
  { id: "1", fullName: "Juan Carlos Peres Rojas", email: "jc.peraz@gmail.com", userType: "titulado", identifier: "201942394", documentType: "academic_diploma", registeredAt: "2026-03-15T10:00:00" },
  { id: "2", fullName: "Maria Quispe Mamani", email: "maria.qui@gmail.com", userType: "titulado", identifier: "201902277", documentType: "national_title", registeredAt: "2026-02-20T10:00:00" },
  { id: "3", fullName: "Luis Fernando Vargaz Saliz", email: "lf.vargas.ct@gmail.com", userType: "titulado", identifier: "201701190", documentType: "national_title", registeredAt: "2025-01-10T10:00:00" },
  { id: "4", fullName: "Andrea Camacho Torrez", email: "andrea.ct@gmail.com", userType: "titulado", identifier: "201905853", documentType: "academic_diploma", registeredAt: "2025-01-10T10:00:00" },
  { id: "5", fullName: "Rodrigo Gutiérrez Arce", email: "r.rutiereer@outlook.com", userType: "titulado", identifier: "201603348", documentType: "national_title", registeredAt: "2025-01-10T10:00:00" },
  { id: "6", fullName: "Sofia Fernandez Claras", email: "sofia.fo@gmail.com", userType: "titulado", identifier: "201909731", documentType: "academic_diploma", registeredAt: "2025-01-10T10:00:00" },
  { id: "7", fullName: "Diego Mercado Rocha", email: "dmercado@gmail.com", userType: "empresa", identifier: "1029964756", documentType: null, registeredAt: "2025-01-10T10:00:00" },
  { id: "8", fullName: "Valeria Amez Lima", email: "vale.amez@gmail.com", userType: "administrativo", identifier: "201902214", documentType: "academic_diploma", registeredAt: "2026-03-15T10:00:00" },
  { id: "9", fullName: "Stephanie Mamani Choque", email: "stephanie.mamani@gmail.com", userType: "titulado", identifier: "202004667", documentType: "national_title", registeredAt: "2026-03-15T10:00:00" },
  { id: "10", fullName: "Carlos Rivera Quispe", email: "carlos.rivera@gmail.com", userType: "titulado", identifier: "201702345", documentType: "national_title", registeredAt: "2026-03-15T10:00:00" },
  { id: "11", fullName: "Ana Lucia Rojas Vera", email: "ana.rojas@gmail.com", userType: "estudiante", identifier: "201801122", documentType: "academic_diploma", registeredAt: "2025-11-04T10:00:00" },
  { id: "12", fullName: "Marco Antonio Flores Paz", email: "marco.flores@gmail.com", userType: "titulado", identifier: "201604587", documentType: "academic_diploma", registeredAt: "2025-10-22T10:00:00" },
  { id: "13", fullName: "Tecnologías Andinas SRL", email: "rrhh@tecandinas.com", userType: "empresa", identifier: "3012457018", documentType: null, registeredAt: "2025-10-15T10:00:00" },
  { id: "14", fullName: "Gabriela Soliz Arnez", email: "gabriela.soliz@gmail.com", userType: "mentor", identifier: "201903318", documentType: "academic_diploma", registeredAt: "2025-09-30T10:00:00" },
  { id: "15", fullName: "Jorge Luis Céspedes Ortiz", email: "jl.cespedes@outlook.com", userType: "titulado", identifier: "201505976", documentType: "national_title", registeredAt: "2025-09-12T10:00:00" },
  { id: "16", fullName: "Paola Andrea Guzmán Ríos", email: "paola.guzman@gmail.com", userType: "titulado", identifier: "201806641", documentType: "academic_diploma", registeredAt: "2025-08-28T10:00:00" },
  { id: "17", fullName: "Innova Soft SA", email: "contacto@innovasoft.bo", userType: "empresa", identifier: "2098754013", documentType: null, registeredAt: "2025-08-14T10:00:00" },
  { id: "18", fullName: "Ricardo Montaño Vidal", email: "ricardo.montano@gmail.com", userType: "estudiante", identifier: "202001459", documentType: "academic_diploma", registeredAt: "2025-07-30T10:00:00" },
  { id: "19", fullName: "Daniela Ugarte Salas", email: "daniela.ugarte@gmail.com", userType: "administrativo", identifier: "201707783", documentType: "academic_diploma", registeredAt: "2025-07-02T10:00:00" },
  { id: "20", fullName: "Fernando Aguilar Terán", email: "f.aguilar@gmail.com", userType: "titulado", identifier: "201408812", documentType: "national_title", registeredAt: "2025-06-18T10:00:00" },
  { id: "21", fullName: "Lucía Herrera Pinto", email: "lucia.herrera@gmail.com", userType: "mentor", identifier: "202102204", documentType: "academic_diploma", registeredAt: "2025-05-27T10:00:00" },
  { id: "22", fullName: "Mauricio Zeballos Durán", email: "mauricio.z@outlook.com", userType: "titulado", identifier: "201609935", documentType: "academic_diploma", registeredAt: "2025-05-06T10:00:00" },
  { id: "23", fullName: "Datalab Bolivia SRL", email: "info@datalab.bo", userType: "empresa", identifier: "4015862011", documentType: null, registeredAt: "2025-04-15T10:00:00" },
  { id: "24", fullName: "Camila Vargas Orellana", email: "camila.vargas@gmail.com", userType: "titulado", identifier: "202003376", documentType: "national_title", registeredAt: "2025-03-20T10:00:00" },
];

function buildResponse({ page, limit, userType, period }: RegisteredUsersParams): ApiResponse<PaginatedData<RegisteredUser>> {
  const filteredUsers = REGISTERED_USERS.filter((user) => {
    const registeredAt = new Date(user.registeredAt);
    const userPeriod = `${registeredAt.getMonth() < 6 ? "I" : "II"}-${registeredAt.getFullYear()}`;
    return (!userType || user.userType === userType) && (!period || userPeriod === period);
  });
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

async function selectPeriod(user: UserEvent, label: string) {
  await user.click(screen.getByRole("button", { name: /^Gestión/ }));
  await user.click(await screen.findByRole("menuitemradio", { name: label }));
}

describe("RegisteredUsersReportView", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-10-08T12:00:00-04:00"));
    vi.spyOn(reportsService, "getRegisteredUsers").mockImplementation(async (params) => buildResponse(params));
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.useRealTimers();
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
    expect(screen.getAllByText("Diploma académico").length).toBeGreaterThan(0);
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
    expect(options).toEqual(["Todos", "Estudiante", "Titulado", "Mentor", "Empresa", "Administrativo"]);
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

  it("filtra por gestión y vuelve a la primera página", async () => {
    const user = userEvent.setup();
    await renderLoadedView();
    await user.click(screen.getByRole("button", { name: "Página 3" }));
    expect(await screen.findByText("Mostrando 21-24 de 24 usuarios")).toBeDefined();

    await selectPeriod(user, "I-2026");

    expect(await screen.findByText("Mostrando 1-5 de 5 usuarios")).toBeDefined();
    expect(screen.queryByText("Camila Vargas Orellana")).toBeNull();
    expect(screen.getByRole("button", { name: "Gestión I-2026" })).toBeDefined();
    expect(reportsService.getRegisteredUsers).toHaveBeenLastCalledWith({
      page: 1, limit: 10, userType: undefined, period: "I-2026",
    });
  });

  it("combina gestión y tipo, conserva ambos al actualizar y permite quitar cada filtro", async () => {
    const user = userEvent.setup();
    await renderLoadedView();
    await selectPeriod(user, "II-2025");
    await selectUserType(user, "Empresa");

    expect(await screen.findByText("Mostrando 1-2 de 2 usuarios")).toBeDefined();
    expect(screen.getByText("Tecnologías Andinas SRL")).toBeDefined();
    expect(screen.queryByText("Diego Mercado Rocha")).toBeNull();
    await user.click(screen.getByRole("button", { name: "actualizar" }));
    await screen.findByText("Mostrando 1-2 de 2 usuarios");
    expect(reportsService.getRegisteredUsers).toHaveBeenLastCalledWith({
      page: 1, limit: 10, userType: "empresa", period: "II-2025",
    });

    await selectPeriod(user, "I-2025");
    expect(await screen.findByText("Diego Mercado Rocha")).toBeDefined();
    expect(screen.queryByText("Tecnologías Andinas SRL")).toBeNull();
    await selectPeriod(user, "Todas");
    expect(await screen.findByText("Mostrando 1-4 de 4 usuarios")).toBeDefined();
    expect(reportsService.getRegisteredUsers).toHaveBeenLastCalledWith({
      page: 1, limit: 10, userType: "empresa", period: undefined,
    });

    await selectPeriod(user, "II-2025");
    await selectUserType(user, "Todos");
    expect(await screen.findByText("Mostrando 1-9 de 9 usuarios")).toBeDefined();
    expect(reportsService.getRegisteredUsers).toHaveBeenLastCalledWith({
      page: 1, limit: 10, userType: undefined, period: "II-2025",
    });
  });

  it("conserva la gestión al paginar y al volver a elegir la opción activa", async () => {
    const user = userEvent.setup();
    vi.mocked(reportsService.getRegisteredUsers).mockImplementation(async ({ page, limit }) => buildResponse({ page, limit }));
    await renderLoadedView();
    await selectPeriod(user, "I-2025");
    await user.click(screen.getByRole("button", { name: "Página 2" }));
    await screen.findByText("Mostrando 11-20 de 24 usuarios");
    expect(reportsService.getRegisteredUsers).toHaveBeenLastCalledWith({
      page: 2, limit: 10, userType: undefined, period: "I-2025",
    });

    const requestCount = vi.mocked(reportsService.getRegisteredUsers).mock.calls.length;
    await selectPeriod(user, "I-2025");
    expect(reportsService.getRegisteredUsers).toHaveBeenCalledTimes(requestCount);
    expect(screen.getByText("Mostrando 11-20 de 24 usuarios")).toBeDefined();
  });

  it("salta a la última página y retrocede conservando los filtros en un reporte grande", async () => {
    const user = userEvent.setup();
    const users: RegisteredUser[] = Array.from({ length: 200 }, (_, index) => ({
      ...REGISTERED_USERS[0],
      id: `company-${index + 1}`,
      fullName: `Empresa ${index + 1}`,
      userType: "empresa",
      registeredAt: "2025-03-15T12:00:00-04:00",
    }));
    vi.mocked(reportsService.getRegisteredUsers).mockImplementation(async ({ page, limit }) => ({
      statusCode: 200,
      data: { items: users.slice((page - 1) * limit, page * limit), totalItems: users.length },
      detail: "Usuarios registrados obtenidos correctamente",
      ok: true,
    }));
    render(<RegisteredUsersReportView />);
    await screen.findByText("Empresa 1");
    await selectUserType(user, "Empresa");
    await selectPeriod(user, "I-2025");

    await user.click(screen.getByRole("button", { name: "Página 20" }));
    expect(await screen.findByText("Mostrando 191-200 de 200 usuarios")).toBeDefined();
    expect(reportsService.getRegisteredUsers).toHaveBeenLastCalledWith({
      page: 20, limit: 10, userType: "empresa", period: "I-2025",
    });
    expect(screen.queryByRole("button", { name: "Página 10" })).toBeNull();
    expect(screen.getByRole("button", { name: "Página siguiente" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Página anterior" }));
    expect(await screen.findByText("Mostrando 181-190 de 200 usuarios")).toBeDefined();
    expect(reportsService.getRegisteredUsers).toHaveBeenLastCalledWith({
      page: 19, limit: 10, userType: "empresa", period: "I-2025",
    });
  });

  it("muestra el estado vacío para una gestión sin usuarios y se recupera con Todas", async () => {
    const user = userEvent.setup();
    await renderLoadedView();
    await selectPeriod(user, "II-2026");

    expect(await screen.findByText("No hay usuarios registrados para este filtro.")).toBeDefined();
    expect(screen.getByText("Mostrando 0-0 de 0 usuarios")).toBeDefined();

    await selectPeriod(user, "Todas");
    expect(await screen.findByText("Mostrando 1-10 de 24 usuarios")).toBeDefined();
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
    await selectPeriod(user, "II-2025");

    await user.click(screen.getByRole("button", { name: "Exportar CSV" }));

    const exportingButton = screen.getByRole("button", { name: "Exportando..." }) as HTMLButtonElement;
    expect(exportingButton.disabled).toBe(true);
    expect(exportSpy).toHaveBeenCalledWith({ userType: "empresa", period: "II-2025" });

    resolveExport({ file, fileName: "usuarios-registrados-2026-10-03.csv" });
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Exportar CSV" })).toBeDefined();
    });
    expect(downloadSpy).toHaveBeenCalledWith(file, "usuarios-registrados-2026-10-03.csv");
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByText("Descarga iniciada. Revisa las descargas de tu navegador.")).toBeDefined();
    expect(screen.queryByText("La exportación de la tabla ha sido un éxito")).toBeNull();
  });

  it("muestra el aviso verde solo cuando termina de guardarse el CSV", async () => {
    const user = userEvent.setup();
    let finishSaving!: () => void;
    const close = vi.fn(() => new Promise<void>((resolve) => { finishSaving = resolve; }));
    const picker = vi.fn().mockResolvedValue({
      createWritable: vi.fn().mockResolvedValue({
        write: vi.fn().mockResolvedValue(undefined),
        close,
        abort: vi.fn().mockResolvedValue(undefined),
      }),
    });
    vi.stubGlobal("showSaveFilePicker", picker);
    vi.spyOn(reportsService, "exportRegisteredUsersCsv").mockResolvedValue({
      file: new Blob(["Usuario"], { type: "text/csv" }),
      fileName: "usuarios.csv",
    });
    await renderLoadedView();

    await user.click(screen.getByRole("button", { name: "Exportar CSV" }));
    await waitFor(() => expect(close).toHaveBeenCalledOnce());
    expect(screen.queryByText("La exportación de la tabla ha sido un éxito")).toBeNull();
    expect(screen.getByRole("button", { name: "Exportando..." })).toBeDisabled();
    expect(picker).toHaveBeenCalledWith(expect.objectContaining({ suggestedName: "usuarios-registrados.csv" }));

    await act(async () => { finishSaving(); });

    const message = await screen.findByText("La exportación de la tabla ha sido un éxito");
    expect(message.parentElement).toHaveClass("bg-green-50");
    expect(screen.queryByText("Descarga iniciada. Revisa las descargas de tu navegador.")).toBeNull();
    expect(screen.getByRole("button", { name: "Exportar CSV" })).toBeEnabled();
  });

  it("muestra un mensaje si falla la exportación", async () => {
    vi.spyOn(reportsService, "exportRegisteredUsersCsv").mockRejectedValueOnce(new Error("Network error"));
    const downloadSpy = vi.spyOn(downloadFileModule, "downloadFile");
    await renderLoadedView();

    fireEvent.click(screen.getByRole("button", { name: "Exportar CSV" }));

    expect((await screen.findByRole("alert")).textContent).toBe("No se pudo exportar el reporte. Inténtalo de nuevo.");
    expect(downloadSpy).not.toHaveBeenCalled();
    expect(screen.queryByText("La exportación de la tabla ha sido un éxito")).toBeNull();
  });
});
