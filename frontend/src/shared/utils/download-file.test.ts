import { afterEach, describe, expect, it, vi } from "vitest";
import { downloadFile, getFileNameFromDisposition } from "./download-file";

describe("getFileNameFromDisposition", () => {
  it("lee el nombre del archivo de la cabecera", () => {
    expect(getFileNameFromDisposition('attachment; filename="reporte.csv"', "otro.csv")).toBe("reporte.csv");
  });

  it("usa el nombre alternativo si la cabecera no existe o no trae nombre", () => {
    expect(getFileNameFromDisposition(undefined, "otro.csv")).toBe("otro.csv");
    expect(getFileNameFromDisposition("attachment", "otro.csv")).toBe("otro.csv");
  });
});

describe("downloadFile", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("descarga el archivo con un enlace temporal y libera la URL", () => {
    URL.createObjectURL = vi.fn(() => "blob:reporte");
    URL.revokeObjectURL = vi.fn();
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
    const file = new Blob(["a,b"], { type: "text/csv" });

    downloadFile(file, "reporte.csv");

    expect(URL.createObjectURL).toHaveBeenCalledWith(file);
    expect(clickSpy).toHaveBeenCalledOnce();
    const link = clickSpy.mock.contexts[0] as HTMLAnchorElement;
    expect(link.download).toBe("reporte.csv");
    expect(link.isConnected).toBe(false);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:reporte");
  });
});
