"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { EMPTY_DOCUMENT, EMPTY_VALUES } from "../constants/access-request-defaults.constants";
import type { DocumentType } from "../constants/document-types.constants";
import { accessRequestService } from "../services/access-request.service";
import type {
  AccessRequestContextValue,
  ClearResult,
  DocumentState,
  FormNotice,
  RequestStep,
  SubmitStatus,
  Submission,
} from "../types/access-request-context.types";
import type { FieldErrors, PersonalDataFieldName, PersonalDataValues } from "../types/access-request.types";
import { buildAccessRequestPayload } from "../utils/build-access-request-payload";
import { validateDocumentFile } from "../utils/validate-document-file";
import { validatePersonalData } from "../utils/validate-personal-data";
import type { AccessRequestProviderProps } from "../types/access-request-provider-props.types";

const MISSING_TYPE_MESSAGE = "Elige el tipo de documento antes de subir el archivo.";

const BUSY_MESSAGE = "Hay una operación en curso. Espera a que termine.";
const ALREADY_SENT_MESSAGE = "La solicitud ya fue enviada.";

const AccessRequestContext = createContext<AccessRequestContextValue | null>(null);

// Estado del flujo solo en memoria: recargar la página pierde el borrador (no se guarda nada en el navegador)
export function AccessRequestProvider({ children }: AccessRequestProviderProps) {
  const [values, setValues] = useState<PersonalDataValues>(EMPTY_VALUES);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState<FormNotice | null>(null);
  const [currentStep, setCurrentStep] = useState<RequestStep>(1);
  const [document, setDocument] = useState<DocumentState>(EMPTY_DOCUMENT);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Las refs evitan envíos duplicados y datos viejos cuando dos eventos llegan antes del siguiente render
  const valuesRef = useRef(values);
  const draftIdRef = useRef<string | null>(null);
  const submittingRef = useRef(false);
  const clearingRef = useRef(false);
  const documentBusyRef = useRef(false);
  const sendingRef = useRef(false);
  // Con la solicitud enviada ya no se puede editar nada
  const submissionRef = useRef<Submission | null>(null);
  const documentRef = useRef<DocumentState>(EMPTY_DOCUMENT);
  // URL de objeto vigente: nunca debe haber dos vivas a la vez
  const previewUrlRef = useRef<string | null>(null);

  const isBusy = useCallback(
    () => submittingRef.current || clearingRef.current || documentBusyRef.current || sendingRef.current,
    [],
  );
  const isLocked = useCallback(() => isBusy() || submissionRef.current !== null, [isBusy]);

  const updateDocument = useCallback((next: DocumentState) => {
    documentRef.current = next;
    setDocument(next);
  }, []);

  const patchDocument = useCallback((patch: Partial<DocumentState>) => {
    documentRef.current = { ...documentRef.current, ...patch };
    setDocument(documentRef.current);
  }, []);

  const revokePreview = useCallback(() => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
  }, []);

  useEffect(() => revokePreview, [revokePreview]);

  const updateDraftId = useCallback((id: string | null) => {
    draftIdRef.current = id;
    setDraftId(id);
  }, []);

  const setValue = useCallback((field: PersonalDataFieldName, value: string) => {
    valuesRef.current = { ...valuesRef.current, [field]: value };
    setValues(valuesRef.current);
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }, []);

  // Cualquier campo con valor (sin contar espacios) cuenta como dato; el draftId no influye
  // Con la solicitud enviada no hay nada que descartar
  const hasData = useMemo(
    () => submission === null && Object.values(values).some((value) => value.trim() !== ""),
    [values, submission],
  );

  const submit = useCallback(async () => {
    if (isLocked()) return;

    const errors = validatePersonalData(valuesRef.current);
    setNotice(null);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    submittingRef.current = true;
    setStatus("submitting");
    setFieldErrors({});

    const currentDraftId = draftIdRef.current;
    const payload = buildAccessRequestPayload(valuesRef.current, currentDraftId ? "update" : "create");
    const result = currentDraftId
      ? await accessRequestService.updateAccessRequest(currentDraftId, payload)
      : await accessRequestService.createAccessRequest(payload);

    if (result.ok) {
      if (!currentDraftId) {
        updateDraftId(result.data.id ?? null);
      }
      setCurrentStep(2);
    } else {
      // Si el borrador ya no existe, el siguiente envío crea uno nuevo
      if (result.status === 404) updateDraftId(null);
      setFieldErrors(result.fieldErrors);
      setNotice({ type: "error", text: result.message });
    }

    submittingRef.current = false;
    setStatus("idle");
  }, [isLocked, updateDraftId]);

  // Vacía el formulario y elimina el borrador del servidor si existe. Si el DELETE falla (salvo 404) no se limpia nada
  const clear = useCallback(async (): Promise<ClearResult> => {
    if (submissionRef.current) return { ok: false, message: ALREADY_SENT_MESSAGE };
    if (isBusy()) return { ok: false, message: BUSY_MESSAGE };

    clearingRef.current = true;
    setStatus("clearing");

    const currentDraftId = draftIdRef.current;
    if (currentDraftId) {
      const result = await accessRequestService.deleteAccessRequest(currentDraftId);
      // Un 404 cuenta como éxito: el borrador ya no existe
      if (!result.ok && result.status !== 404) {
        clearingRef.current = false;
        setStatus("idle");
        return { ok: false, message: result.message };
      }
    }

    valuesRef.current = EMPTY_VALUES;
    setValues(EMPTY_VALUES);
    setFieldErrors({});
    setNotice(null);
    updateDraftId(null);
    // El DELETE del borrador ya elimina el documento en el backend
    revokePreview();
    updateDocument(EMPTY_DOCUMENT);
    setCurrentStep(1);

    clearingRef.current = false;
    setStatus("idle");
    return { ok: true };
  }, [isBusy, updateDraftId, revokePreview, updateDocument]);

  // El paso 2 exige un borrador guardado; volver al paso 1 no borra nada
  const goToStep = useCallback((step: RequestStep) => {
    if (isLocked() || step === 3) return;
    if (step === 2 && !draftIdRef.current) return;
    setCurrentStep(step);
  }, [isLocked]);

  const selectDocumentType = useCallback(
    (type: DocumentType) => {
      if (isLocked() || documentRef.current.previewUrl) return;
      patchDocument({ documentType: type, error: null });
    },
    [isLocked, patchDocument],
  );

  const uploadDocument = useCallback(
    async (file: File) => {
      const currentDraftId = draftIdRef.current;
      if (!currentDraftId || isLocked()) return;

      const type = documentRef.current.documentType;
      if (!type) {
        patchDocument({ error: MISSING_TYPE_MESSAGE });
        return;
      }
      const invalid = validateDocumentFile(file);
      if (invalid) {
        patchDocument({ error: invalid });
        return;
      }

      documentBusyRef.current = true;
      setStatus("uploading");
      patchDocument({ progress: 0, error: null });

      const result = await accessRequestService.uploadDocument(currentDraftId, file, type, (percent) =>
        patchDocument({ progress: percent }),
      );

      if (result.ok) {
        // Se revoca la URL anterior antes de crear la nueva
        revokePreview();
        previewUrlRef.current = URL.createObjectURL(file);
        updateDocument({
          documentType: type,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          previewUrl: previewUrlRef.current,
          progress: 100,
          error: null,
        });
      } else if (result.status === 404) {
        // El borrador ya no existe: se vuelve al paso 1 y el siguiente guardado crea uno nuevo
        updateDraftId(null);
        revokePreview();
        updateDocument(EMPTY_DOCUMENT);
        setCurrentStep(1);
        setNotice({ type: "error", text: result.message });
      } else {
        patchDocument({ error: result.message, progress: 0 });
      }

      documentBusyRef.current = false;
      setStatus("idle");
    },
    [isLocked, patchDocument, revokePreview, updateDocument, updateDraftId],
  );

  const removeDocument = useCallback(async () => {
    const currentDraftId = draftIdRef.current;
    if (!currentDraftId || !documentRef.current.previewUrl || isLocked()) return;

    documentBusyRef.current = true;
    setStatus("removing");

    const result = await accessRequestService.removeDocument(currentDraftId);

    // Un 404 cuenta como éxito: el documento ya no está. Se conserva el tipo elegido
    if (result.ok || result.status === 404) {
      revokePreview();
      updateDocument({ ...EMPTY_DOCUMENT, documentType: documentRef.current.documentType });
    } else {
      patchDocument({ error: result.message });
    }

    documentBusyRef.current = false;
    setStatus("idle");
  }, [isLocked, patchDocument, revokePreview, updateDocument]);

  // Envía el borrador con documento: pasa a pending y la persona ve la pantalla de revisión (paso 3)
  const submitRequest = useCallback(async () => {
    const currentDraftId = draftIdRef.current;
    if (!currentDraftId || !documentRef.current.previewUrl || isLocked()) return;

    sendingRef.current = true;
    setStatus("sending");
    setSubmitError(null);

    const result = await accessRequestService.submitAccessRequest(currentDraftId);

    if (result.ok) {
      const sent: Submission = {
        requestCode: result.data.requestCode,
        submittedAt: result.data.submittedAt,
        status: result.data.status,
        reviewedAt: null,
        rejectionReason: null,
      };
      submissionRef.current = sent;
      setSubmission(sent);
      setCurrentStep(3);
    } else if (result.status === 404) {
      // El borrador ya no existe: se vuelve al paso 1 y el siguiente guardado crea uno nuevo
      updateDraftId(null);
      revokePreview();
      updateDocument(EMPTY_DOCUMENT);
      setCurrentStep(1);
      setNotice({ type: "error", text: result.message });
    } else {
      setSubmitError(result.message);
    }

    sendingRef.current = false;
    setStatus("idle");
  }, [isLocked, revokePreview, updateDocument, updateDraftId]);

  // Actualiza el estado desde el servidor; si la consulta falla no se cambia nada ni se muestra error
  const refreshSubmission = useCallback(async () => {
    const current = submissionRef.current;
    if (!current) return;

    const result = await accessRequestService.getRequestStatus(current.requestCode, valuesRef.current.email.trim().toLowerCase());
    if (!result.ok || !submissionRef.current) return;

    const next: Submission = {
      ...submissionRef.current,
      status: result.data.status,
      reviewedAt: result.data.reviewedAt ?? null,
      rejectionReason: result.data.rejectionReason ?? null,
    };
    submissionRef.current = next;
    setSubmission(next);
  }, []);

  const value = useMemo(
    () => ({
      values,
      draftId,
      status,
      fieldErrors,
      notice,
      hasData,
      currentStep,
      document,
      hasDocument: document.previewUrl !== null,
      submission,
      submitError,
      setValue,
      submit,
      clear,
      goToStep,
      selectDocumentType,
      uploadDocument,
      removeDocument,
      submitRequest,
      refreshSubmission,
    }),
    [
      values,
      draftId,
      status,
      fieldErrors,
      notice,
      hasData,
      currentStep,
      document,
      submission,
      submitError,
      setValue,
      submit,
      clear,
      goToStep,
      selectDocumentType,
      uploadDocument,
      removeDocument,
      submitRequest,
      refreshSubmission,
    ],
  );

  return <AccessRequestContext.Provider value={value}>{children}</AccessRequestContext.Provider>;
}

export function useAccessRequestForm(): AccessRequestContextValue {
  const context = useContext(AccessRequestContext);
  if (!context) {
    throw new Error("useAccessRequestForm debe usarse dentro de AccessRequestProvider");
  }
  return context;
}
