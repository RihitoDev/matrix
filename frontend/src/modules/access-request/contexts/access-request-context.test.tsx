import type { ReactNode } from "react";
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { accessRequestService } from "../services/access-request.service";
import type { ApiResult } from "../types/access-request.types";
import { AccessRequestProvider, useAccessRequestForm } from "./access-request-context";

vi.mock("../services/access-request.service", () => ({
  accessRequestService: {
    createAccessRequest: vi.fn(),
    updateAccessRequest: vi.fn(),
    deleteAccessRequest: vi.fn(),
    uploadDocument: vi.fn(),
    removeDocument: vi.fn(),
    submitAccessRequest: vi.fn(),
    getRequestStatus: vi.fn(),
  },
}));

const create = vi.mocked(accessRequestService.createAccessRequest);
const update = vi.mocked(accessRequestService.updateAccessRequest);
const remove = vi.mocked(accessRequestService.deleteAccessRequest);
const upload = vi.mocked(accessRequestService.uploadDocument);
const removeDoc = vi.mocked(accessRequestService.removeDocument);
const submitReq = vi.mocked(accessRequestService.submitAccessRequest);
const getStatus = vi.mocked(accessRequestService.getRequestStatus);

const BUSY = "Hay una operación en curso. Espera a que termine.";
const MB = 1024 * 1024;

function pdf(name = "titulo.pdf", size = 1000) {
  const file = new File(["%PDF-1.4"], name, { type: "application/pdf" });
  Object.defineProperty(file, "size", { value: size });
  return file;
}

// jsdom no implementa las URL de objeto: se simulan con un contador para poder contar las vivas
let urlCounter = 0;
const liveUrls = new Set<string>();
const createUrl = vi.fn<(file: unknown) => string>(() => {
  const url = `blob:preview-${++urlCounter}`;
  liveUrls.add(url);
  return url;
});
const revokeUrl = vi.fn((url: string) => {
  liveUrls.delete(url);
});

const uploadOk = (documentType: "academic_diploma" | "national_title" = "national_title"): ApiResult<never> =>
  ({ ok: true, data: { id: "draft-1", documentFileId: "file-1", documentType } }) as never;

const wrapper = ({ children }: { children: ReactNode }) => <AccessRequestProvider>{children}</AccessRequestProvider>;

const failure = (status: number, message: string): ApiResult<never> => ({ ok: false, status, fieldErrors: {}, message });

function setup() {
  return renderHook(() => useAccessRequestForm(), { wrapper });
}

type Hook = ReturnType<typeof setup>;

function fillValid(hook: Hook) {
  act(() => {
    const { setValue } = hook.result.current;
    setValue("firstName", "Ana María");
    setValue("lastName", "Rojas");
    setValue("idCardNumber", "1234567");
    setValue("idCardIssuedIn", "LP");
    setValue("sisCode", "202012345");
    setValue("email", "ana@umss.edu.bo");
    setValue("birthDate", "2000-05-10");
    setValue("graduationYear", "2019");
    setValue("career", "Licenciatura en Ingeniería de Sistemas");
  });
}

async function saveDraft(hook: Hook, id = "draft-1") {
  create.mockResolvedValueOnce({ ok: true, data: { id } });
  await act(async () => {
    await hook.result.current.submit();
  });
}

// Deja el paso 2 listo: borrador guardado y tipo elegido
async function readyForUpload(hook: Hook, type: "academic_diploma" | "national_title" = "national_title") {
  fillValid(hook);
  await saveDraft(hook);
  act(() => hook.result.current.selectDocumentType(type));
}

async function uploadFile(hook: Hook, file: File = pdf()) {
  await act(async () => {
    await hook.result.current.uploadDocument(file);
  });
}

describe("AccessRequestProvider: limpieza y hasData", () => {
  beforeEach(() => {
    create.mockReset();
    update.mockReset();
    remove.mockReset();
    upload.mockReset();
    removeDoc.mockReset();
    urlCounter = 0;
    liveUrls.clear();
    createUrl.mockClear();
    revokeUrl.mockClear();
    vi.stubGlobal("URL", Object.assign(URL, { createObjectURL: createUrl, revokeObjectURL: revokeUrl }));
  });
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  describe("hasData", () => {
    it("es false con todo vacío", () => {
      const hook = setup();

      expect(hook.result.current.hasData).toBe(false);
    });

    it("es false con solo espacios", () => {
      const hook = setup();

      act(() => hook.result.current.setValue("firstName", "   "));

      expect(hook.result.current.hasData).toBe(false);
    });

    it("es true con un campo con valor, aunque no haya borrador", () => {
      const hook = setup();

      act(() => hook.result.current.setValue("career", "Licenciatura en Ingeniería de Sistemas"));

      expect(hook.result.current.hasData).toBe(true);
      expect(hook.result.current.draftId).toBeNull();
    });
  });

  describe("clear", () => {
    it("sin borrador limpia valores, errores y aviso sin llamar al servicio", async () => {
      const hook = setup();
      act(() => hook.result.current.setValue("firstName", "Ana"));
      await act(async () => {
        await hook.result.current.submit();
      });
      expect(Object.keys(hook.result.current.fieldErrors).length).toBeGreaterThan(0);

      let result;
      await act(async () => {
        result = await hook.result.current.clear();
      });

      expect(result).toEqual({ ok: true });
      expect(hook.result.current.values.firstName).toBe("");
      expect(hook.result.current.fieldErrors).toEqual({});
      expect(hook.result.current.notice).toBeNull();
      expect(hook.result.current.hasData).toBe(false);
      expect(hook.result.current.status).toBe("idle");
      expect(remove).not.toHaveBeenCalled();
    });

    it("con borrador llama a deleteAccessRequest con el id, limpia y el siguiente envío crea", async () => {
      remove.mockResolvedValue({ ok: true, data: { id: "draft-1" } });
      const hook = setup();
      fillValid(hook);
      await saveDraft(hook);
      expect(hook.result.current.draftId).toBe("draft-1");

      let result;
      await act(async () => {
        result = await hook.result.current.clear();
      });

      expect(result).toEqual({ ok: true });
      expect(remove).toHaveBeenCalledTimes(1);
      expect(remove).toHaveBeenCalledWith("draft-1");
      expect(hook.result.current.draftId).toBeNull();
      expect(hook.result.current.notice).toBeNull();
      expect(hook.result.current.values.email).toBe("");

      fillValid(hook);
      create.mockResolvedValueOnce({ ok: true, data: { id: "draft-2" } });
      await act(async () => {
        await hook.result.current.submit();
      });

      expect(create).toHaveBeenCalledTimes(2);
      expect(update).not.toHaveBeenCalled();
      expect(hook.result.current.draftId).toBe("draft-2");
    });

    it("un 404 del DELETE cuenta como éxito y limpia igual", async () => {
      remove.mockResolvedValue(failure(404, "La solicitud ya no existe"));
      const hook = setup();
      fillValid(hook);
      await saveDraft(hook);

      let result;
      await act(async () => {
        result = await hook.result.current.clear();
      });

      expect(result).toEqual({ ok: true });
      expect(hook.result.current.draftId).toBeNull();
      expect(hook.result.current.hasData).toBe(false);
    });

    it.each([
      ["409", failure(409, "La solicitud ya fue enviada y no se puede eliminar")],
      ["error de red", failure(0, "No se pudo conectar con el servidor. Inténtalo de nuevo.")],
    ])("un %s del DELETE no limpia nada y devuelve el mensaje", async (_name, failed) => {
      remove.mockResolvedValue(failed);
      const hook = setup();
      fillValid(hook);
      await saveDraft(hook);

      let result;
      await act(async () => {
        result = await hook.result.current.clear();
      });

      expect(result).toEqual({ ok: false, message: failed.ok ? "" : failed.message });
      expect(hook.result.current.values.firstName).toBe("Ana María");
      expect(hook.result.current.draftId).toBe("draft-1");
      expect(hook.result.current.currentStep).toBe(2);
      expect(hook.result.current.status).toBe("idle");
    });

    it("tras un DELETE fallido se puede reintentar", async () => {
      remove.mockResolvedValueOnce(failure(0, "sin red"));
      remove.mockResolvedValueOnce({ ok: true, data: { id: "draft-1" } });
      const hook = setup();
      fillValid(hook);
      await saveDraft(hook);

      await act(async () => {
        await hook.result.current.clear();
      });
      let result;
      await act(async () => {
        result = await hook.result.current.clear();
      });

      expect(result).toEqual({ ok: true });
      expect(remove).toHaveBeenCalledTimes(2);
      expect(hook.result.current.draftId).toBeNull();
    });

    it("dos llamadas simultáneas hacen una sola llamada al servicio", async () => {
      let resolve!: (value: ApiResult<{ id?: string }>) => void;
      remove.mockReturnValue(new Promise((done) => (resolve = done)));
      const hook = setup();
      fillValid(hook);
      await saveDraft(hook);

      let first!: Promise<unknown>;
      let second!: Promise<unknown>;
      await act(async () => {
        first = hook.result.current.clear();
        second = hook.result.current.clear();
      });

      expect(hook.result.current.status).toBe("clearing");
      await expect(second).resolves.toEqual({ ok: false, message: "Hay una operación en curso. Espera a que termine." });
      await act(async () => {
        resolve({ ok: true, data: { id: "draft-1" } });
        await first;
      });

      expect(remove).toHaveBeenCalledTimes(1);
      expect(hook.result.current.status).toBe("idle");
    });

    it("durante un envío en curso devuelve ok false sin tocar nada", async () => {
      let resolve!: (value: ApiResult<{ id: string }>) => void;
      create.mockReturnValue(new Promise((done) => (resolve = done)));
      const hook = setup();
      fillValid(hook);

      let submitting!: Promise<void>;
      await act(async () => {
        submitting = hook.result.current.submit();
      });
      expect(hook.result.current.status).toBe("submitting");

      let result;
      await act(async () => {
        result = await hook.result.current.clear();
      });

      expect(result).toEqual({ ok: false, message: "Hay una operación en curso. Espera a que termine." });
      expect(remove).not.toHaveBeenCalled();
      expect(hook.result.current.values.firstName).toBe("Ana María");
      expect(hook.result.current.status).toBe("submitting");

      await act(async () => {
        resolve({ ok: true, data: { id: "draft-1" } });
        await submitting;
      });
    });

    it("submit se ignora mientras se limpia", async () => {
      let resolve!: (value: ApiResult<{ id?: string }>) => void;
      remove.mockReturnValue(new Promise((done) => (resolve = done)));
      const hook = setup();
      fillValid(hook);
      await saveDraft(hook);
      create.mockClear();

      let clearing!: Promise<unknown>;
      await act(async () => {
        clearing = hook.result.current.clear();
      });
      await act(async () => {
        await hook.result.current.submit();
      });

      expect(create).not.toHaveBeenCalled();
      expect(update).not.toHaveBeenCalled();

      await act(async () => {
        resolve({ ok: true, data: { id: "draft-1" } });
        await clearing;
      });
    });
  });
});

describe("AccessRequestProvider: paso 2 (documento de respaldo)", () => {
  beforeEach(() => {
    create.mockReset();
    update.mockReset();
    remove.mockReset();
    upload.mockReset();
    removeDoc.mockReset();
    urlCounter = 0;
    liveUrls.clear();
    createUrl.mockClear();
    revokeUrl.mockClear();
    vi.stubGlobal("URL", Object.assign(URL, { createObjectURL: createUrl, revokeObjectURL: revokeUrl }));
  });
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  describe("estado inicial y submit", () => {
    it("empieza en el paso 1 con el documento vacío", () => {
      const hook = setup();

      expect(hook.result.current.currentStep).toBe(1);
      expect(hook.result.current.hasDocument).toBe(false);
      expect(hook.result.current.document).toEqual({
        documentType: null,
        fileName: null,
        fileSize: null,
        mimeType: null,
        previewUrl: null,
        progress: 0,
        error: null,
      });
    });

    it("un create exitoso pasa al paso 2 y deja el aviso en null", async () => {
      const hook = setup();
      fillValid(hook);

      await saveDraft(hook);

      expect(hook.result.current.currentStep).toBe(2);
      expect(hook.result.current.notice).toBeNull();
      expect(hook.result.current.draftId).toBe("draft-1");
    });

    it("un update exitoso también pasa al paso 2", async () => {
      const hook = setup();
      fillValid(hook);
      await saveDraft(hook);
      act(() => hook.result.current.goToStep(1));
      update.mockResolvedValueOnce({ ok: true, data: {} });

      await act(async () => {
        await hook.result.current.submit();
      });

      expect(update).toHaveBeenCalledWith("draft-1", expect.any(Object));
      expect(hook.result.current.currentStep).toBe(2);
      expect(hook.result.current.notice).toBeNull();
    });

    it("un envío con error se queda en el paso 1", async () => {
      const hook = setup();
      fillValid(hook);
      create.mockResolvedValueOnce(failure(500, "falló"));

      await act(async () => {
        await hook.result.current.submit();
      });

      expect(hook.result.current.currentStep).toBe(1);
      expect(hook.result.current.notice).toEqual({ type: "error", text: "falló" });
    });

    it("un envío inválido se queda en el paso 1", async () => {
      const hook = setup();

      await act(async () => {
        await hook.result.current.submit();
      });

      expect(hook.result.current.currentStep).toBe(1);
      expect(create).not.toHaveBeenCalled();
    });
  });

  describe("goToStep", () => {
    it("goToStep(2) sin borrador no cambia de paso", () => {
      const hook = setup();

      act(() => hook.result.current.goToStep(2));

      expect(hook.result.current.currentStep).toBe(1);
    });

    it("goToStep(2) con borrador avanza", async () => {
      const hook = setup();
      fillValid(hook);
      await saveDraft(hook);
      act(() => hook.result.current.goToStep(1));

      act(() => hook.result.current.goToStep(2));

      expect(hook.result.current.currentStep).toBe(2);
    });

    it("goToStep(1) conserva valores, borrador y documento", async () => {
      upload.mockResolvedValue(uploadOk());
      const hook = setup();
      await readyForUpload(hook);
      await uploadFile(hook);

      act(() => hook.result.current.goToStep(1));

      expect(hook.result.current.currentStep).toBe(1);
      expect(hook.result.current.values.firstName).toBe("Ana María");
      expect(hook.result.current.draftId).toBe("draft-1");
      expect(hook.result.current.hasDocument).toBe(true);
      expect(revokeUrl).not.toHaveBeenCalled();
    });

    it("se ignora mientras hay una operación en curso", async () => {
      let resolve!: (value: ApiResult<never>) => void;
      upload.mockReturnValue(new Promise((done) => (resolve = done)));
      const hook = setup();
      await readyForUpload(hook);

      let pending!: Promise<void>;
      await act(async () => {
        pending = hook.result.current.uploadDocument(pdf());
      });
      act(() => hook.result.current.goToStep(1));

      expect(hook.result.current.currentStep).toBe(2);
      await act(async () => {
        resolve(uploadOk());
        await pending;
      });
    });
  });

  describe("selectDocumentType", () => {
    it("guarda el tipo y limpia el error", async () => {
      const hook = setup();
      fillValid(hook);
      await saveDraft(hook);
      await uploadFile(hook);
      expect(hook.result.current.document.error).not.toBeNull();

      act(() => hook.result.current.selectDocumentType("academic_diploma"));

      expect(hook.result.current.document.documentType).toBe("academic_diploma");
      expect(hook.result.current.document.error).toBeNull();
    });

    it("se ignora con un documento ya subido", async () => {
      const hook = setup();
      await readyForUpload(hook, "national_title");
      upload.mockResolvedValue(uploadOk());
      await uploadFile(hook);

      act(() => hook.result.current.selectDocumentType("academic_diploma"));

      expect(hook.result.current.document.documentType).toBe("national_title");
    });
  });

  describe("uploadDocument", () => {
    it("sin tipo elegido deja el mensaje y no llama al servicio", async () => {
      const hook = setup();
      fillValid(hook);
      await saveDraft(hook);

      await uploadFile(hook);

      expect(hook.result.current.document.error).toBe("Elige el tipo de documento antes de subir el archivo.");
      expect(upload).not.toHaveBeenCalled();
    });

    it("sin borrador se ignora sin mensaje", async () => {
      const hook = setup();
      act(() => hook.result.current.selectDocumentType("national_title"));

      await uploadFile(hook);

      expect(upload).not.toHaveBeenCalled();
      expect(hook.result.current.document.error).toBeNull();
    });

    it.each([
      ["formato", new File(["x"], "a.exe", { type: "application/x-msdownload" }), "Formato no permitido. Solo se aceptan archivos JPG, PNG o PDF."],
      ["vacío", pdf("a.pdf", 0), "El archivo está vacío."],
      ["más de 10 MB", pdf("a.pdf", 10 * MB + 1), "El archivo supera el máximo de 10 MB."],
    ])("un archivo inválido (%s) da su mensaje y no llama al servicio", async (_name, file, message) => {
      const hook = setup();
      await readyForUpload(hook);

      await uploadFile(hook, file);

      expect(hook.result.current.document.error).toBe(message);
      expect(upload).not.toHaveBeenCalled();
      expect(hook.result.current.status).toBe("idle");
    });

    it("un archivo inválido no toca el documento ya subido", async () => {
      const hook = setup();
      await readyForUpload(hook);
      upload.mockResolvedValue(uploadOk());
      await uploadFile(hook, pdf("bueno.pdf"));
      const before = hook.result.current.document.previewUrl;

      await uploadFile(hook, pdf("malo.pdf", 0));

      expect(hook.result.current.document.fileName).toBe("bueno.pdf");
      expect(hook.result.current.document.previewUrl).toBe(before);
      expect(hook.result.current.document.error).toBe("El archivo está vacío.");
      expect(revokeUrl).not.toHaveBeenCalled();
    });

    it("con éxito guarda metadatos y URL, informa el progreso y vuelve a idle", async () => {
      upload.mockImplementation(async (_id, _file, _type, onProgress) => {
        onProgress?.(40);
        onProgress?.(100);
        return uploadOk();
      });
      const hook = setup();
      await readyForUpload(hook);
      const file = pdf("titulo.pdf", 2048);

      await uploadFile(hook, file);

      expect(upload).toHaveBeenCalledWith("draft-1", file, "national_title", expect.any(Function));
      expect(createUrl).toHaveBeenCalledWith(file);
      expect(hook.result.current.document).toEqual({
        documentType: "national_title",
        fileName: "titulo.pdf",
        fileSize: 2048,
        mimeType: "application/pdf",
        previewUrl: "blob:preview-1",
        progress: 100,
        error: null,
      });
      expect(hook.result.current.hasDocument).toBe(true);
      expect(hook.result.current.status).toBe("idle");
      expect(Object.values(hook.result.current.document)).not.toContain(file);
    });

    it("refleja el progreso mientras sube y el estado uploading", async () => {
      let report!: (percent: number) => void;
      let resolve!: (value: ApiResult<never>) => void;
      upload.mockImplementation((_id, _file, _type, onProgress) => {
        report = onProgress!;
        return new Promise((done) => (resolve = done as never));
      });
      const hook = setup();
      await readyForUpload(hook);

      let pending!: Promise<void>;
      await act(async () => {
        pending = hook.result.current.uploadDocument(pdf());
      });
      expect(hook.result.current.status).toBe("uploading");
      expect(hook.result.current.document.progress).toBe(0);

      act(() => report(55));
      expect(hook.result.current.document.progress).toBe(55);

      await act(async () => {
        resolve(uploadOk());
        await pending;
      });
      expect(hook.result.current.document.progress).toBe(100);
    });

    it("un reemplazo revoca la URL anterior y deja una sola viva", async () => {
      upload.mockResolvedValue(uploadOk());
      const hook = setup();
      await readyForUpload(hook);

      await uploadFile(hook, pdf("uno.pdf"));
      await uploadFile(hook, pdf("dos.pdf"));

      expect(revokeUrl).toHaveBeenCalledWith("blob:preview-1");
      expect(hook.result.current.document.previewUrl).toBe("blob:preview-2");
      expect(hook.result.current.document.fileName).toBe("dos.pdf");
      expect([...liveUrls]).toEqual(["blob:preview-2"]);
    });

    it("un 404 reinicia: sin borrador, paso 1, documento vacío, URL revocada y aviso", async () => {
      upload.mockResolvedValueOnce(uploadOk());
      const hook = setup();
      await readyForUpload(hook);
      await uploadFile(hook);
      upload.mockResolvedValueOnce(failure(404, "La solicitud ya no existe"));

      await uploadFile(hook, pdf("otro.pdf"));

      expect(hook.result.current.draftId).toBeNull();
      expect(hook.result.current.currentStep).toBe(1);
      expect(hook.result.current.document.previewUrl).toBeNull();
      expect(hook.result.current.document.documentType).toBeNull();
      expect(hook.result.current.hasDocument).toBe(false);
      expect(hook.result.current.notice).toEqual({ type: "error", text: "La solicitud ya no existe" });
      expect(hook.result.current.status).toBe("idle");
      expect(liveUrls.size).toBe(0);
    });

    it("otro error conserva el documento previo, deja el mensaje y pone el progreso en 0", async () => {
      upload.mockResolvedValueOnce(uploadOk());
      const hook = setup();
      await readyForUpload(hook);
      await uploadFile(hook, pdf("bueno.pdf"));
      upload.mockResolvedValueOnce(failure(400, "Solo se permiten archivos JPG, PNG o PDF"));

      await uploadFile(hook, pdf("otro.pdf"));

      expect(hook.result.current.document.error).toBe("Solo se permiten archivos JPG, PNG o PDF");
      expect(hook.result.current.document.fileName).toBe("bueno.pdf");
      expect(hook.result.current.document.previewUrl).toBe("blob:preview-1");
      expect(hook.result.current.document.progress).toBe(0);
      expect(hook.result.current.status).toBe("idle");
      expect(liveUrls.size).toBe(1);
    });

    it("un error sin documento previo deja el mensaje y ninguna URL", async () => {
      upload.mockResolvedValue(failure(413, "El archivo supera el máximo de 10 MB."));
      const hook = setup();
      await readyForUpload(hook);

      await uploadFile(hook);

      expect(hook.result.current.document.error).toBe("El archivo supera el máximo de 10 MB.");
      expect(hook.result.current.hasDocument).toBe(false);
      expect(createUrl).not.toHaveBeenCalled();
    });

    it("dos llamadas simultáneas hacen una sola llamada al servicio", async () => {
      let resolve!: (value: ApiResult<never>) => void;
      upload.mockReturnValue(new Promise((done) => (resolve = done)));
      const hook = setup();
      await readyForUpload(hook);

      let first!: Promise<void>;
      let second!: Promise<void>;
      await act(async () => {
        first = hook.result.current.uploadDocument(pdf("uno.pdf"));
        second = hook.result.current.uploadDocument(pdf("dos.pdf"));
      });
      await second;

      expect(upload).toHaveBeenCalledTimes(1);
      await act(async () => {
        resolve(uploadOk());
        await first;
      });
      expect(hook.result.current.status).toBe("idle");
    });
  });

  describe("removeDocument", () => {
    async function withDocument() {
      upload.mockResolvedValue(uploadOk());
      const hook = setup();
      await readyForUpload(hook);
      await uploadFile(hook);
      return hook;
    }

    it("con éxito vacía el documento conservando el tipo y revoca la URL", async () => {
      const hook = await withDocument();
      removeDoc.mockResolvedValue({ ok: true, data: { id: "draft-1", documentFileId: null } });

      await act(async () => {
        await hook.result.current.removeDocument();
      });

      expect(removeDoc).toHaveBeenCalledWith("draft-1");
      expect(hook.result.current.document).toEqual({
        documentType: "national_title",
        fileName: null,
        fileSize: null,
        mimeType: null,
        previewUrl: null,
        progress: 0,
        error: null,
      });
      expect(hook.result.current.hasDocument).toBe(false);
      expect(hook.result.current.status).toBe("idle");
      expect(revokeUrl).toHaveBeenCalledWith("blob:preview-1");
      expect(liveUrls.size).toBe(0);
    });

    it("un 404 cuenta como éxito", async () => {
      const hook = await withDocument();
      removeDoc.mockResolvedValue(failure(404, "La solicitud ya no existe"));

      await act(async () => {
        await hook.result.current.removeDocument();
      });

      expect(hook.result.current.hasDocument).toBe(false);
      expect(hook.result.current.document.documentType).toBe("national_title");
      expect(liveUrls.size).toBe(0);
    });

    it("con error conserva todo y deja el mensaje", async () => {
      const hook = await withDocument();
      removeDoc.mockResolvedValue(failure(409, "La solicitud ya fue enviada y no se puede modificar"));

      await act(async () => {
        await hook.result.current.removeDocument();
      });

      expect(hook.result.current.hasDocument).toBe(true);
      expect(hook.result.current.document.fileName).toBe("titulo.pdf");
      expect(hook.result.current.document.error).toBe("La solicitud ya fue enviada y no se puede modificar");
      expect(hook.result.current.status).toBe("idle");
      expect(revokeUrl).not.toHaveBeenCalled();
    });

    it("sin documento no llama al servicio", async () => {
      const hook = setup();
      await readyForUpload(hook);

      await act(async () => {
        await hook.result.current.removeDocument();
      });

      expect(removeDoc).not.toHaveBeenCalled();
    });

    it("muestra el estado removing mientras borra", async () => {
      const hook = await withDocument();
      let resolve!: (value: ApiResult<never>) => void;
      removeDoc.mockReturnValue(new Promise((done) => (resolve = done as never)));

      let pending!: Promise<void>;
      await act(async () => {
        pending = hook.result.current.removeDocument();
      });
      expect(hook.result.current.status).toBe("removing");

      await act(async () => {
        resolve({ ok: true, data: { id: "draft-1", documentFileId: null } } as never);
        await pending;
      });
      expect(hook.result.current.status).toBe("idle");
    });
  });

  describe("clear con documento", () => {
    it("resetea el paso y el documento, revoca la URL y no llama a removeDocument", async () => {
      upload.mockResolvedValue(uploadOk());
      remove.mockResolvedValue({ ok: true, data: { id: "draft-1" } });
      const hook = setup();
      await readyForUpload(hook);
      await uploadFile(hook);

      let result;
      await act(async () => {
        result = await hook.result.current.clear();
      });

      expect(result).toEqual({ ok: true });
      expect(hook.result.current.currentStep).toBe(1);
      expect(hook.result.current.document.previewUrl).toBeNull();
      expect(hook.result.current.document.documentType).toBeNull();
      expect(removeDoc).not.toHaveBeenCalled();
      expect(revokeUrl).toHaveBeenCalledWith("blob:preview-1");
      expect(liveUrls.size).toBe(0);
    });

    it("con el DELETE fallido no toca nada", async () => {
      upload.mockResolvedValue(uploadOk());
      remove.mockResolvedValue(failure(409, "no se puede"));
      const hook = setup();
      await readyForUpload(hook);
      await uploadFile(hook);

      await act(async () => {
        await hook.result.current.clear();
      });

      expect(hook.result.current.currentStep).toBe(2);
      expect(hook.result.current.hasDocument).toBe(true);
      expect(hook.result.current.draftId).toBe("draft-1");
      expect(revokeUrl).not.toHaveBeenCalled();
    });

    it.each(["uploading", "removing"] as const)("mientras está en %s devuelve ok false", async (phase) => {
      upload.mockResolvedValueOnce(uploadOk());
      const hook = setup();
      await readyForUpload(hook);
      await uploadFile(hook);

      let resolve!: (value: ApiResult<never>) => void;
      const pendingResult = new Promise<ApiResult<never>>((done) => (resolve = done));
      let pending!: Promise<void>;
      if (phase === "uploading") {
        upload.mockReturnValueOnce(pendingResult as never);
        await act(async () => {
          pending = hook.result.current.uploadDocument(pdf("nuevo.pdf"));
        });
      } else {
        removeDoc.mockReturnValueOnce(pendingResult as never);
        await act(async () => {
          pending = hook.result.current.removeDocument();
        });
      }
      expect(hook.result.current.status).toBe(phase);

      let result;
      await act(async () => {
        result = await hook.result.current.clear();
      });

      expect(result).toEqual({ ok: false, message: BUSY });
      expect(remove).not.toHaveBeenCalled();
      expect(hook.result.current.draftId).toBe("draft-1");

      await act(async () => {
        resolve(phase === "uploading" ? uploadOk() : ({ ok: true, data: { id: "draft-1", documentFileId: null } } as never));
        await pending;
      });
    });
  });

  describe("limpieza de URLs", () => {
    it("desmontar el Provider revoca la URL vigente", async () => {
      upload.mockResolvedValue(uploadOk());
      const hook = setup();
      await readyForUpload(hook);
      await uploadFile(hook);
      expect(liveUrls.size).toBe(1);

      hook.unmount();

      expect(revokeUrl).toHaveBeenCalledWith("blob:preview-1");
      expect(liveUrls.size).toBe(0);
    });

    it("desmontar sin documento no revoca nada", () => {
      const hook = setup();

      hook.unmount();

      expect(revokeUrl).not.toHaveBeenCalled();
    });

    it("nunca hay más de una URL viva a lo largo de subir, reemplazar y quitar", async () => {
      upload.mockResolvedValue(uploadOk());
      removeDoc.mockResolvedValue({ ok: true, data: { id: "draft-1", documentFileId: null } });
      const hook = setup();
      await readyForUpload(hook);
      const sizes: number[] = [];

      await uploadFile(hook, pdf("uno.pdf"));
      sizes.push(liveUrls.size);
      await uploadFile(hook, pdf("dos.pdf"));
      sizes.push(liveUrls.size);
      await uploadFile(hook, pdf("tres.pdf"));
      sizes.push(liveUrls.size);
      await act(async () => {
        await hook.result.current.removeDocument();
      });
      sizes.push(liveUrls.size);

      expect(sizes).toEqual([1, 1, 1, 0]);
    });
  });
});

describe("AccessRequestProvider: envío de la solicitud (paso 3)", () => {
  const sent = { ok: true, data: { id: "draft-1", requestCode: "SOL-2026-0001", status: "pending", submittedAt: "2026-10-05T23:59:34.644Z" } } as const;

  beforeEach(() => {
    for (const mock of [create, update, remove, upload, removeDoc, submitReq, getStatus]) mock.mockReset();
    urlCounter = 0;
    liveUrls.clear();
    createUrl.mockClear();
    revokeUrl.mockClear();
    vi.stubGlobal("URL", Object.assign(URL, { createObjectURL: createUrl, revokeObjectURL: revokeUrl }));
  });
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  async function readyToSend() {
    upload.mockResolvedValue(uploadOk());
    const hook = setup();
    await readyForUpload(hook);
    await uploadFile(hook);
    return hook;
  }

  async function send(hook: Hook) {
    await act(async () => {
      await hook.result.current.submitRequest();
    });
  }

  it("un envío feliz guarda la solicitud, pasa al paso 3 y vuelve a idle", async () => {
    submitReq.mockResolvedValue(sent);
    const hook = await readyToSend();

    await send(hook);

    expect(submitReq).toHaveBeenCalledWith("draft-1");
    expect(hook.result.current.submission).toEqual({
      requestCode: "SOL-2026-0001",
      submittedAt: "2026-10-05T23:59:34.644Z",
      status: "pending",
      reviewedAt: null,
      rejectionReason: null,
    });
    expect(hook.result.current.currentStep).toBe(3);
    expect(hook.result.current.status).toBe("idle");
    expect(hook.result.current.submitError).toBeNull();
  });

  it("sin documento no llama al servicio", async () => {
    const hook = setup();
    fillValid(hook);
    await saveDraft(hook);

    await send(hook);

    expect(submitReq).not.toHaveBeenCalled();
    expect(hook.result.current.currentStep).toBe(2);
  });

  it("sin borrador no llama al servicio", async () => {
    const hook = setup();

    await send(hook);

    expect(submitReq).not.toHaveBeenCalled();
  });

  it("un doble clic hace una sola llamada y muestra sending", async () => {
    let resolve!: (value: ApiResult<never>) => void;
    submitReq.mockReturnValue(new Promise((done) => (resolve = done as never)));
    const hook = await readyToSend();

    let first!: Promise<void>;
    let second!: Promise<void>;
    await act(async () => {
      first = hook.result.current.submitRequest();
      second = hook.result.current.submitRequest();
    });
    await second;
    expect(hook.result.current.status).toBe("sending");

    await act(async () => {
      resolve(sent as never);
      await first;
    });

    expect(submitReq).toHaveBeenCalledTimes(1);
  });

  it("un 409 deja el mensaje, sin cambiar de paso", async () => {
    submitReq.mockResolvedValue(failure(409, "Ya tienes una solicitud activa"));
    const hook = await readyToSend();

    await send(hook);

    expect(hook.result.current.submitError).toBe("Ya tienes una solicitud activa");
    expect(hook.result.current.currentStep).toBe(2);
    expect(hook.result.current.submission).toBeNull();
    expect(hook.result.current.status).toBe("idle");
    expect(hook.result.current.hasDocument).toBe(true);
  });

  it("un error de red deja el mensaje y permite reintentar", async () => {
    submitReq.mockResolvedValueOnce(failure(0, "No se pudo conectar con el servidor. Inténtalo de nuevo."));
    submitReq.mockResolvedValueOnce(sent as never);
    const hook = await readyToSend();

    await send(hook);
    expect(hook.result.current.submitError).toBe("No se pudo conectar con el servidor. Inténtalo de nuevo.");
    await send(hook);

    expect(hook.result.current.submitError).toBeNull();
    expect(hook.result.current.currentStep).toBe(3);
  });

  it("un 404 reinicia: sin borrador, paso 1, documento vacío, URL revocada y aviso", async () => {
    submitReq.mockResolvedValue(failure(404, "La solicitud ya no existe"));
    const hook = await readyToSend();

    await send(hook);

    expect(hook.result.current.draftId).toBeNull();
    expect(hook.result.current.currentStep).toBe(1);
    expect(hook.result.current.hasDocument).toBe(false);
    expect(hook.result.current.document.documentType).toBeNull();
    expect(hook.result.current.notice).toEqual({ type: "error", text: "La solicitud ya no existe" });
    expect(liveUrls.size).toBe(0);
  });

  it("mientras envía bloquea goToStep y clear", async () => {
    let resolve!: (value: ApiResult<never>) => void;
    submitReq.mockReturnValue(new Promise((done) => (resolve = done as never)));
    const hook = await readyToSend();

    let pending!: Promise<void>;
    await act(async () => {
      pending = hook.result.current.submitRequest();
    });
    act(() => hook.result.current.goToStep(1));
    let result;
    await act(async () => {
      result = await hook.result.current.clear();
    });

    expect(hook.result.current.currentStep).toBe(2);
    expect(result).toEqual({ ok: false, message: BUSY });
    expect(remove).not.toHaveBeenCalled();

    await act(async () => {
      resolve(sent as never);
      await pending;
    });
  });

  describe("con la solicitud ya enviada", () => {
    async function sentHook() {
      submitReq.mockResolvedValue(sent);
      const hook = await readyToSend();
      await send(hook);
      return hook;
    }

    it("hasData es false aunque haya valores", async () => {
      const hook = await sentHook();

      expect(hook.result.current.values.firstName).toBe("Ana María");
      expect(hook.result.current.hasData).toBe(false);
    });

    it("bloquea goToStep, clear, subir, quitar, elegir tipo y el guardado del paso 1", async () => {
      const hook = await sentHook();
      upload.mockClear();
      create.mockClear();
      update.mockClear();

      act(() => hook.result.current.goToStep(1));
      let result;
      await act(async () => {
        result = await hook.result.current.clear();
      });
      await uploadFile(hook, pdf("otro.pdf"));
      await act(async () => {
        await hook.result.current.removeDocument();
        await hook.result.current.submit();
        await hook.result.current.submitRequest();
      });
      act(() => hook.result.current.selectDocumentType("academic_diploma"));

      expect(hook.result.current.currentStep).toBe(3);
      expect(result).toEqual({ ok: false, message: "La solicitud ya fue enviada." });
      expect(remove).not.toHaveBeenCalled();
      expect(upload).not.toHaveBeenCalled();
      expect(removeDoc).not.toHaveBeenCalled();
      expect(create).not.toHaveBeenCalled();
      expect(update).not.toHaveBeenCalled();
      expect(submitReq).toHaveBeenCalledTimes(1);
      expect(hook.result.current.document.documentType).toBe("national_title");
      expect(hook.result.current.draftId).toBe("draft-1");
    });

    it("al desmontar se sigue revocando la URL de la vista previa", async () => {
      const hook = await sentHook();
      expect(liveUrls.size).toBe(1);

      hook.unmount();

      expect(liveUrls.size).toBe(0);
    });

    it("refreshSubmission actualiza estado, fecha de revisión y motivo con el correo en minúsculas", async () => {
      getStatus.mockResolvedValue({
        ok: true,
        data: {
          requestCode: "SOL-2026-0001",
          status: "rejected",
          submittedAt: "2026-10-05T23:59:34.644Z",
          reviewedAt: "2026-10-06T14:00:00.000Z",
          rejectionReason: "Documento ilegible",
          document: null,
        },
      });
      const hook = await sentHook();

      await act(async () => {
        await hook.result.current.refreshSubmission();
      });

      expect(getStatus).toHaveBeenCalledWith("SOL-2026-0001", "ana@umss.edu.bo");
      expect(hook.result.current.submission).toMatchObject({
        status: "rejected",
        reviewedAt: "2026-10-06T14:00:00.000Z",
        rejectionReason: "Documento ilegible",
        requestCode: "SOL-2026-0001",
      });
    });

    it("si la consulta falla no cambia nada ni muestra error", async () => {
      getStatus.mockResolvedValue(failure(0, "sin red"));
      const hook = await sentHook();
      const before = hook.result.current.submission;

      await act(async () => {
        await hook.result.current.refreshSubmission();
      });

      expect(hook.result.current.submission).toEqual(before);
      expect(hook.result.current.submitError).toBeNull();
      expect(hook.result.current.notice).toBeNull();
    });
  });

  it("refreshSubmission sin solicitud enviada no consulta", async () => {
    const hook = setup();

    await act(async () => {
      await hook.result.current.refreshSubmission();
    });

    expect(getStatus).not.toHaveBeenCalled();
  });
});
