import { afterEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "@/shared/services/api-client";
import { reportsService } from "./reports.service";

describe("reportsService.getReportHistory", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("consulta el endpoint del historial con la página y el límite", async () => {
    const response = {
      statusCode: 200,
      data: { items: [], totalItems: 0 },
      page: 2,
      detail: "Historial de reportes obtenido correctamente",
      ok: true,
    };
    const getSpy = vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: response });

    const result = await reportsService.getReportHistory({ page: 2, limit: 10 });

    expect(getSpy).toHaveBeenCalledWith("/reports/history", { params: { page: 2, limit: 10 } });
    expect(result).toEqual(response);
  });
});

describe("reportsService.getRegisteredUsers", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("consulta el endpoint de registrados con la página, el límite y el tipo de usuario", async () => {
    const response = {
      statusCode: 200,
      data: { items: [], totalItems: 0 },
      page: 1,
      detail: "Usuarios registrados obtenidos correctamente",
      ok: true,
    };
    const getSpy = vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: response });

    const result = await reportsService.getRegisteredUsers({ page: 1, limit: 10, userType: "COMPANY" });

    expect(getSpy).toHaveBeenCalledWith("/reports/registered-users", {
      params: { page: 1, limit: 10, userType: "COMPANY" },
    });
    expect(result).toEqual(response);
  });
});

describe("reportsService.getRejectedUsers", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("consulta el endpoint de rechazados con la página, el límite y la búsqueda", async () => {
    const response = {
      statusCode: 200,
      data: { items: [], totalItems: 0 },
      page: 2,
      detail: "Usuarios rechazados obtenidos correctamente",
      ok: true,
    };
    const getSpy = vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: response });

    const result = await reportsService.getRejectedUsers({ page: 2, limit: 10, search: "juan" });

    expect(getSpy).toHaveBeenCalledWith("/reports/rejected-users", {
      params: { page: 2, limit: 10, search: "juan" },
    });
    expect(result).toEqual(response);
  });

  it("no envía la búsqueda cuando está vacía", async () => {
    const getSpy = vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: {} });

    await reportsService.getRejectedUsers({ page: 1, limit: 10, search: "" });

    expect(getSpy).toHaveBeenCalledWith("/reports/rejected-users", {
      params: { page: 1, limit: 10, search: undefined },
    });
  });
});

describe("reportsService.exportRegisteredUsersCsv", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("descarga el CSV como archivo con el filtro de tipo de usuario", async () => {
    const file = new Blob(["Usuario"], { type: "text/csv" });
    const getSpy = vi.spyOn(apiClient, "get").mockResolvedValueOnce({
      data: file,
      headers: { "content-disposition": 'attachment; filename="usuarios-registrados-2026-10-03.csv"' },
    });

    const result = await reportsService.exportRegisteredUsersCsv({ userType: "COMPANY" });

    expect(getSpy).toHaveBeenCalledWith("/reports/registered-users/export", {
      params: { userType: "COMPANY" },
      responseType: "blob",
    });
    expect(result).toEqual({ file, fileName: "usuarios-registrados-2026-10-03.csv" });
  });

  it("usa un nombre por defecto si el backend no envía el nombre del archivo", async () => {
    vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: new Blob([]), headers: {} });

    const result = await reportsService.exportRegisteredUsersCsv({});

    expect(result.fileName).toBe("usuarios-registrados.csv");
  });
});

describe("reportsService.exportRejectedUsersCsv", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("descarga el CSV como archivo con la búsqueda por correo", async () => {
    const file = new Blob(["Usuario"], { type: "text/csv" });
    const getSpy = vi.spyOn(apiClient, "get").mockResolvedValueOnce({
      data: file,
      headers: { "content-disposition": 'attachment; filename="usuarios-rechazados-2026-10-03.csv"' },
    });

    const result = await reportsService.exportRejectedUsersCsv({ search: "juan" });

    expect(getSpy).toHaveBeenCalledWith("/reports/rejected-users/export", {
      params: { search: "juan" },
      responseType: "blob",
    });
    expect(result).toEqual({ file, fileName: "usuarios-rechazados-2026-10-03.csv" });
  });

  it("no envía la búsqueda vacía y usa un nombre por defecto", async () => {
    const getSpy = vi.spyOn(apiClient, "get").mockResolvedValueOnce({ data: new Blob([]), headers: {} });

    const result = await reportsService.exportRejectedUsersCsv({ search: "" });

    expect(getSpy).toHaveBeenCalledWith("/reports/rejected-users/export", {
      params: { search: undefined },
      responseType: "blob",
    });
    expect(result.fileName).toBe("usuarios-rechazados.csv");
  });
});
