import { useEffect } from "react";
import type { ReactElement } from "react";
import { act, render } from "@testing-library/react";
import { vi } from "vitest";
import type { DocumentType } from "../../constants/document-types.constants";
import { AccessRequestProvider, useAccessRequestForm } from "../../contexts/access-request-context";
import { accessRequestService } from "../../services/access-request.service";
import type { AccessRequestContextValue } from "../../types/access-request-context.types";
import type { ApiResult } from "../../types/access-request.types";

// Utilidades solo para pruebas del paso 2: el servicio debe estar mockeado con vi.mock en cada archivo de prueba

export const DRAFT_ID = "draft-1";

type ContextRef = { current: AccessRequestContextValue | null };

function Capture({ onValue }: { onValue: (value: AccessRequestContextValue) => void }) {
  const value = useAccessRequestForm();
  useEffect(() => onValue(value), [onValue, value]);
  return null;
}

function StepProbe() {
  const { currentStep } = useAccessRequestForm();
  return <p>{`paso-actual:${currentStep}`}</p>;
}

export function renderWithContext(ui: ReactElement) {
  const target: ContextRef = { current: null };
  const onValue = (value: AccessRequestContextValue) => {
    target.current = value;
  };
  const utils = render(
    <AccessRequestProvider>
      <Capture onValue={onValue} />
      <StepProbe />
      {ui}
    </AccessRequestProvider>,
  );
  const ctx = () => {
    if (!target.current) throw new Error("El Context aún no está disponible");
    return target.current;
  };
  return { ...utils, ctx };
}

type Ctx = ReturnType<typeof renderWithContext>["ctx"];

// Deja el Context en el paso 2: datos válidos guardados con un borrador y, si se pide, el tipo elegido
export async function reachStep2(ctx: Ctx, documentType?: DocumentType) {
  act(() => {
    const { setValue } = ctx();
    setValue("firstName", " Ana María ");
    setValue("lastName", "Rojas ");
    setValue("idCardNumber", "1234567");
    setValue("idCardIssuedIn", "LP");
    setValue("sisCode", "202012345");
    setValue("email", "ana@umss.edu.bo");
    setValue("birthDate", "2000-05-10");
    setValue("graduationYear", "2019");
    setValue("career", "Licenciatura en Ingeniería de Sistemas");
  });
  vi.mocked(accessRequestService.createAccessRequest).mockResolvedValueOnce({ ok: true, data: { id: DRAFT_ID } });
  await act(async () => {
    await ctx().submit();
  });
  if (documentType) act(() => ctx().selectDocumentType(documentType));
}

export function uploadSucceeds(documentType: DocumentType = "national_title") {
  vi.mocked(accessRequestService.uploadDocument).mockResolvedValue({
    ok: true,
    data: { id: DRAFT_ID, documentFileId: "file-1", documentType },
  });
}

export async function uploadFile(ctx: Ctx, file: File) {
  await act(async () => {
    await ctx().uploadDocument(file);
  });
}

export function makeFile(name = "titulo.pdf", type = "application/pdf", size?: number) {
  const file = new File(["%PDF-1.4"], name, { type });
  if (size !== undefined) Object.defineProperty(file, "size", { value: size });
  return file;
}

export const failure = (status: number, message: string): ApiResult<never> => ({ ok: false, status, fieldErrors: {}, message });

// jsdom no implementa las URL de objeto
export function stubObjectUrls() {
  let counter = 0;
  const create = vi.fn<(file: unknown) => string>(() => `blob:preview-${++counter}`);
  const revoke = vi.fn<(url: string) => void>();
  vi.stubGlobal("URL", Object.assign(URL, { createObjectURL: create, revokeObjectURL: revoke }));
  return { create, revoke };
}
