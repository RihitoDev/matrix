import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SaveFileHandle } from "@/shared/types/save-file.types";
import * as downloadFileModule from "@/shared/utils/download-file";
import { EXPORT_SUCCESS_MESSAGE, EXPORT_SUCCESS_TOAST_DURATION_MS } from "../constants/reports.constants";
import { useExportReportCsv } from "./use-export-report-csv";

const EXPORTED_FILE = { file: new Blob(["Usuario"], { type: "text/csv" }), fileName: "usuarios.csv" };

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => { resolve = resolvePromise; });
  return { promise, resolve };
}

describe("useExportReportCsv", () => {
  const write = vi.fn().mockResolvedValue(undefined);
  const close = vi.fn().mockResolvedValue(undefined);
  const abort = vi.fn().mockResolvedValue(undefined);
  const createWritable = vi.fn().mockResolvedValue({ write, close, abort });
  const handle: SaveFileHandle = { createWritable };
  const picker = vi.fn().mockResolvedValue(handle);

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    vi.stubGlobal("showSaveFilePicker", picker);
    vi.spyOn(downloadFileModule, "downloadFile").mockImplementation(() => undefined);
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("abre Guardar como antes de solicitar el reporte y conserva la activación del clic", async () => {
    const selection = deferred<SaveFileHandle>();
    picker.mockReturnValueOnce(selection.promise);
    const exportReport = vi.fn().mockResolvedValue(EXPORTED_FILE);
    const { result } = renderHook(() => useExportReportCsv(exportReport, "reporte.csv"));
    let exporting!: Promise<void>;

    act(() => { exporting = result.current.exportCsv(); });

    expect(picker).toHaveBeenCalledWith({
      suggestedName: "reporte.csv",
      types: [{ description: "Archivo CSV", accept: { "text/csv": [".csv"] } }],
      excludeAcceptAllOption: true,
    });
    expect(exportReport).not.toHaveBeenCalled();
    expect(result.current.successMessage).toBeUndefined();

    await act(async () => {
      selection.resolve(handle);
      await exporting;
    });

    expect(write).toHaveBeenCalledWith(EXPORTED_FILE.file);
    expect(close).toHaveBeenCalledOnce();
    expect(downloadFileModule.downloadFile).not.toHaveBeenCalled();
  });

  it("espera la escritura y el cierre del archivo antes de mostrar éxito", async () => {
    const writing = deferred<void>();
    const closing = deferred<void>();
    write.mockReturnValueOnce(writing.promise);
    close.mockReturnValueOnce(closing.promise);
    const { result } = renderHook(() => useExportReportCsv(() => Promise.resolve(EXPORTED_FILE), "usuarios.csv"));
    let exporting!: Promise<void>;

    await act(async () => { exporting = result.current.exportCsv(); });

    expect(write).toHaveBeenCalledWith(EXPORTED_FILE.file);
    expect(close).not.toHaveBeenCalled();
    expect(result.current.successMessage).toBeUndefined();
    expect(result.current.isExporting).toBe(true);

    await act(async () => { writing.resolve(); });
    expect(close).toHaveBeenCalledOnce();
    expect(result.current.successMessage).toBeUndefined();
    expect(result.current.isExporting).toBe(true);

    await act(async () => {
      closing.resolve();
      await exporting;
    });

    expect(result.current.successMessage).toBe(EXPORT_SUCCESS_MESSAGE);
    expect(result.current.isExporting).toBe(false);
  });

  it("oculta el aviso unos segundos después de confirmar el guardado", async () => {
    const { result } = renderHook(() => useExportReportCsv(() => Promise.resolve(EXPORTED_FILE), "usuarios.csv"));

    await act(async () => { await result.current.exportCsv(); });
    expect(result.current.successMessage).toBe(EXPORT_SUCCESS_MESSAGE);

    await act(async () => { await vi.advanceTimersByTimeAsync(EXPORT_SUCCESS_TOAST_DURATION_MS - 1); });
    expect(result.current.successMessage).toBe(EXPORT_SUCCESS_MESSAGE);

    await act(async () => { await vi.advanceTimersByTimeAsync(1); });
    expect(result.current.successMessage).toBeUndefined();
  });

  it("no muestra éxito ni error al cancelar Guardar como y permite volver a exportar", async () => {
    picker.mockRejectedValueOnce(new DOMException("Cancelado", "AbortError"));
    const exportReport = vi.fn().mockResolvedValue(EXPORTED_FILE);
    const { result } = renderHook(() => useExportReportCsv(exportReport, "usuarios.csv"));

    await act(async () => { await result.current.exportCsv(); });

    expect(exportReport).not.toHaveBeenCalled();
    expect(downloadFileModule.downloadFile).not.toHaveBeenCalled();
    expect(result.current.successMessage).toBeUndefined();
    expect(result.current.errorMessage).toBeUndefined();
    expect(result.current.isExporting).toBe(false);

    await act(async () => { await result.current.exportCsv(); });
    expect(result.current.successMessage).toBe(EXPORT_SUCCESS_MESSAGE);
  });

  it("no inicia otra exportación mientras se está guardando", async () => {
    const closing = deferred<void>();
    close.mockReturnValueOnce(closing.promise);
    const exportReport = vi.fn().mockResolvedValue(EXPORTED_FILE);
    const { result } = renderHook(() => useExportReportCsv(exportReport, "usuarios.csv"));
    let exporting!: Promise<void>;

    await act(async () => {
      exporting = result.current.exportCsv();
      await result.current.exportCsv();
    });

    expect(picker).toHaveBeenCalledOnce();
    expect(exportReport).toHaveBeenCalledOnce();
    await act(async () => {
      closing.resolve();
      await exporting;
    });
  });

  it("muestra el aviso de éxito al descargar cuando el navegador no permite elegir destino", async () => {
    vi.stubGlobal("showSaveFilePicker", undefined);
    const { result } = renderHook(() => useExportReportCsv(() => Promise.resolve(EXPORTED_FILE), "reporte.csv"));

    await act(async () => { await result.current.exportCsv(); });

    expect(downloadFileModule.downloadFile).toHaveBeenCalledWith(EXPORTED_FILE.file, "usuarios.csv");
    expect(result.current.successMessage).toBe(EXPORT_SUCCESS_MESSAGE);
    expect(result.current.errorMessage).toBeUndefined();
    await act(async () => { await vi.advanceTimersByTimeAsync(EXPORT_SUCCESS_TOAST_DURATION_MS); });
    expect(result.current.successMessage).toBeUndefined();
  });

  it("no muestra éxito si falla la generación del CSV", async () => {
    const { result } = renderHook(() => useExportReportCsv(() => Promise.reject(new Error("Network error")), "usuarios.csv"));

    await act(async () => { await result.current.exportCsv(); });

    expect(createWritable).not.toHaveBeenCalled();
    expect(result.current.successMessage).toBeUndefined();
    expect(result.current.errorMessage).toBe("No se pudo exportar el reporte. Inténtalo de nuevo.");
  });

  it.each(["write", "close"] as const)("no muestra éxito si falla %s al guardar", async (stage) => {
    const error = new DOMException("No se pudo guardar", "AbortError");
    ({ write, close })[stage].mockRejectedValueOnce(error);
    const { result } = renderHook(() => useExportReportCsv(() => Promise.resolve(EXPORTED_FILE), "usuarios.csv"));

    await act(async () => { await result.current.exportCsv(); });

    expect(abort).toHaveBeenCalledOnce();
    expect(result.current.successMessage).toBeUndefined();
    expect(result.current.errorMessage).toBe("No se pudo exportar el reporte. Inténtalo de nuevo.");
    expect(result.current.isExporting).toBe(false);
  });

  it("informa si se deniega el permiso de escritura", async () => {
    createWritable.mockRejectedValueOnce(new DOMException("Permiso denegado", "NotAllowedError"));
    const { result } = renderHook(() => useExportReportCsv(() => Promise.resolve(EXPORTED_FILE), "usuarios.csv"));

    await act(async () => { await result.current.exportCsv(); });

    expect(write).not.toHaveBeenCalled();
    expect(result.current.successMessage).toBeUndefined();
    expect(result.current.errorMessage).toBe("No se pudo exportar el reporte. Inténtalo de nuevo.");
  });

  it("no inicia una descarga alternativa si el navegador bloquea Guardar como", async () => {
    picker.mockRejectedValueOnce(new DOMException("No permitido", "SecurityError"));
    const exportReport = vi.fn().mockResolvedValue(EXPORTED_FILE);
    const { result } = renderHook(() => useExportReportCsv(exportReport, "usuarios.csv"));

    await act(async () => { await result.current.exportCsv(); });

    expect(exportReport).not.toHaveBeenCalled();
    expect(downloadFileModule.downloadFile).not.toHaveBeenCalled();
    expect(result.current.successMessage).toBeUndefined();
    expect(result.current.errorMessage).toBe("No se pudo exportar el reporte. Inténtalo de nuevo.");
  });
});
